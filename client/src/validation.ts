
export function validatePhone(phone: string) {
  return /^\d{10}$/.test(phone)
    ? ""
    : "Enter a valid 10-digit phone number.";
}

export function validateOtp(otp: string) {
  return /^\d{6}$/.test(otp) ? "" : "Enter the 6-digit OTP.";
}

export function validateLoan(input: {
  friendName: string;
  amount: string;
  dueDate: string;
  note: string;
}) {
  const errors: Record<string, string> = {};
  const name = input.friendName.trim();
  const amountText = input.amount.trim();
  const amount = Number(amountText);

  if (!name) {
    errors.friendName = "Friend name is required.";
  } else if (name.length > 100) {
    errors.friendName = "Use 100 characters or fewer.";
  } else if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    errors.friendName = "Use letters, spaces, apostrophes or hyphens only.";
  }

  if (!amountText) {
    errors.amount = "Amount is required.";
  } else if (!/^\d+(\.\d{1,2})?$/.test(amountText)) {
    errors.amount = "Enter a valid amount with up to 2 decimal places.";
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Enter an amount greater than zero.";
  } else if (amount > 10_000_000) {
    errors.amount = "Amount cannot exceed ₹1 crore.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) {
    errors.dueDate = "Use YYYY-MM-DD.";
  } else {
    const date = new Date(`${input.dueDate}T00:00:00Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== input.dueDate
    ) {
      errors.dueDate = "Enter a real calendar date.";
    } else {
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });

      if (input.dueDate < today) {
        errors.dueDate = "Due date cannot be in the past.";
      }
    }
  }

  if (input.note.trim().length > 255) {
    errors.note = "Use 255 characters or fewer.";
  }

  return errors;
}

export function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function isOverdue(dueDate: string, repaidAt?: string | null) {
  if (repaidAt) return false;

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  return dueDate < today;
}
