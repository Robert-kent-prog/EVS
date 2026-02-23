import { Student } from "../types";

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}

const MIN_ATTENDANCE_PERCENT = 70;

export const checkExamCardEligibility = (student: Student): EligibilityResult => {
  const reasons: string[] = [];
  
  // 1. Attendance Check (>= 70%)
  if ((student.attendance || 0) < MIN_ATTENDANCE_PERCENT) {
    reasons.push(
      `Attendance is ${student.attendance || 0}% (Required: at least ${MIN_ATTENDANCE_PERCENT}%)`,
    );
  }

  // 2. Fee Balance Check (<= 0)
  if (student.feeBalance && student.feeBalance > 0) {
    reasons.push(`Outstanding Fee Balance: KES ${student.feeBalance}`);
  }

  // 3. Lecturer Evaluations Check
  if (!student.lecturerEvaluations?.completed) {
    reasons.push("Lecturer evaluations are not completed");
  }

  // 4. Registered Units Check (only after fees are cleared)
  const hasOutstandingFees = (student.feeBalance || 0) > 0;
  if (hasOutstandingFees) {
    reasons.push("Units are only available for registration after fee clearance");
  } else if (!student.registeredCourses || student.registeredCourses.length === 0) {
    reasons.push("No units registered for the current semester");
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
};
