import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import moment from "moment";
import {
  PRAYER_SESSIONS,
  getSessionTypeFromTime,
  getEffectiveCheckoutTime,
} from "../../lib/prayer-session-utils";

const supabaseUrl = "https://oeouovzsxkspjpmrwvrx.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string;

interface AutoCheckoutResult {
  success: boolean;
  message: string;
  checkedOutCount?: number;
  errors?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AutoCheckoutResult>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  // Verify the API key for security (for cron jobs)
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;
  const expectedApiKey = process.env.AUTO_CHECKOUT_API_KEY;

  if (expectedApiKey && apiKey !== expectedApiKey) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = moment();
    const currentHour = now.hour();

    // Determine which session just ended
    let sessionType: "AM" | "PM" | null = null;

    // AM session ends at 6:00 AM - run auto-checkout between 6:00 AM and 6:30 AM
    if (currentHour === PRAYER_SESSIONS.AM.endHour) {
      sessionType = "AM";
    }
    // PM session ends at 8:00 PM (20:00) - run auto-checkout between 8:00 PM and 8:30 PM
    else if (currentHour === PRAYER_SESSIONS.PM.endHour) {
      sessionType = "PM";
    }

    if (!sessionType) {
      return res.status(200).json({
        success: true,
        message: "No session has just ended. Auto-checkout not needed.",
        checkedOutCount: 0,
      });
    }

    // Find all check-ins without checkout for today's session
    const todayStart = moment().startOf("day").toISOString();
    const todayEnd = moment().endOf("day").toISOString();

    const { data: openCheckins, error: fetchError } = await supabase
      .from("checkin")
      .select("id, checkin_time, session_type")
      .is("checkout_time", null)
      .gte("checkin_time", todayStart)
      .lte("checkin_time", todayEnd);

    if (fetchError) {
      console.error("Error fetching open check-ins:", fetchError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch open check-ins",
        errors: [fetchError.message],
      });
    }

    if (!openCheckins || openCheckins.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No open check-ins found for auto-checkout",
        checkedOutCount: 0,
      });
    }

    // Filter check-ins that belong to the session that just ended
    const checkinsToClose = openCheckins.filter((checkin) => {
      // If session_type is stored, use it
      if (checkin.session_type) {
        return checkin.session_type === sessionType;
      }
      // Otherwise, infer from check-in time
      const inferredType = getSessionTypeFromTime(checkin.checkin_time);
      return inferredType === sessionType;
    });

    if (checkinsToClose.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No open check-ins found for ${sessionType} session`,
        checkedOutCount: 0,
      });
    }

    // Calculate the session end time for effective checkout
    const session = PRAYER_SESSIONS[sessionType];
    const sessionEndTime = moment()
      .startOf("day")
      .hour(session.endHour)
      .toISOString();

    const errors: string[] = [];
    let successCount = 0;

    // Update each check-in with auto-checkout
    for (const checkin of checkinsToClose) {
      const effectiveCheckoutTime = getEffectiveCheckoutTime(
        moment(sessionEndTime),
        sessionType,
        moment(checkin.checkin_time)
      ).toISOString();

      const { error: updateError } = await supabase
        .from("checkin")
        .update({
          checkout_time: sessionEndTime,
          effective_checkout_time: effectiveCheckoutTime,
        })
        .eq("id", checkin.id);

      if (updateError) {
        console.error(
          `Error auto-checking out checkin ${checkin.id}:`,
          updateError
        );
        errors.push(`Failed to checkout ${checkin.id}: ${updateError.message}`);
      } else {
        successCount++;
      }
    }

    return res.status(200).json({
      success: errors.length === 0,
      message: `Auto-checkout completed for ${sessionType} session`,
      checkedOutCount: successCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Auto-checkout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during auto-checkout",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    });
  }
}
