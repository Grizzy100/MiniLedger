import * as SecureStore from "expo-secure-store";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";


const TOKEN_KEY = "miniledger_access_token";

export type Loan = {
  id: string;
  friendName: string;
  amountPaise: number;
  dueDate: string;
  note?: string | null;
  repaidAt?: string | null;
  createdAt: string;
  hasReceipt: boolean;
  receiptUrl?: string | null;
};

export type Summary = {
  totalLentPaise: number;
  totalRepaidPaise: number;
  outstandingPaise: number;
  overduePaise: number;
  activeLoans: number;
  repaidLoans: number;
};

type ApiResponse<T> = {
  data: T;
  message?: string;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    const reason =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);

    if (__DEV__) console.warn(
      "[api] failed",
      options.method ?? "GET",
      `${API_URL}${path}`,
      reason,
    );

    throw new Error(`Request failed (${reason})`);
  }

  const body = (await response.json().catch(() => ({}))) as {
    message?: string;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      body.error?.message ?? body.message ?? "Something went wrong",
    );
  }

  return body as T;
}

// Expo's global fetch does not accept React Native's { uri, name, type }
// file parts in FormData ("Unsupported FormDataPart implementation").
// XMLHttpRequest still does, so multipart uploads go through it.
function uploadForm<T>(path: string, form: FormData, token: string | null) {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}${path}`);
    xhr.timeout = 30000;
    xhr.setRequestHeader("Accept", "application/json");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    // No Content-Type here: the runtime adds multipart/form-data + boundary.

    xhr.onload = () => {
      let body: { message?: string; error?: { message?: string } } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON response, keep the empty body
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as T);
      } else {
        reject(
          new Error(body.error?.message ?? body.message ?? "Something went wrong"),
        );
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading the receipt"));
    xhr.ontimeout = () => reject(new Error("The upload timed out. Try again."));
    xhr.send(form);
  });
}

export async function requestOtp(phone: string, countryCode = "+91") {
  return request<{
    message: string;
    expiresIn: number;
    mockOtp?: string;
  }>("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone: `${countryCode}${phone}` }),
  });
}

export async function verifyOtp(
  phone: string,
  otp: string,
  countryCode = "+91",
) {
  const result = await request<{ message: string; token: string }>(
    "/auth/verify-otp",
    {
      method: "POST",
      body: JSON.stringify({ phone: `${countryCode}${phone}`, otp }),
    },
  );

  await SecureStore.setItemAsync(TOKEN_KEY, result.token);
}

export async function getLoans(page = 1) {
  return request<{ data: Loan[]; pagination: { totalPages: number } }>(
    `/loans?page=${page}`,
  );
}

export async function getSummary() {
  const result = await request<ApiResponse<Summary>>("/loans/summary");
  return result.data;
}

export type ReceiptFile = { uri: string; name: string; type: string };

export async function createLoan(input: {
  friendName: string;
  amountPaise: number;
  dueDate: string;
  note?: string;
  receipt?: ReceiptFile;
}) {
  if (input.receipt?.uri) {
    const form = new FormData();
    form.append("friendName", input.friendName);
    form.append("amountPaise", String(input.amountPaise));
    form.append("dueDate", input.dueDate);
    if (input.note) form.append("note", input.note);

    // The cast only satisfies TypeScript, which expects a web Blob.
    form.append("receipt", {
      uri: input.receipt.uri,
      name: input.receipt.name || "receipt.jpg",
      type: input.receipt.type || "image/jpeg",
    } as unknown as Blob);

    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const result = await uploadForm<ApiResponse<Loan>>("/loans", form, token);
    return result.data;
  }

  const result = await request<ApiResponse<Loan>>("/loans", {
    method: "POST",
    body: JSON.stringify({
      friendName: input.friendName,
      amountPaise: input.amountPaise,
      dueDate: input.dueDate,
      note: input.note,
    }),
  });
  return result.data;
}

export async function getAuthToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getReceiptDataUri(loanId: string) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const response = await fetch(`${API_URL}/loans/${loanId}/receipt`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: { message?: string };
    };
    throw new Error(
      body.error?.message ?? body.message ?? "Could not load this receipt.",
    );
  }

  const blob = await response.blob();
  const dataUri = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read the receipt image."));
      }
    };
    reader.onerror = () => reject(new Error("Could not read the receipt image."));
    reader.readAsDataURL(blob);
  });

  return dataUri;
}

export async function repayLoan(id: string) {
  const result = await request<ApiResponse<Loan>>(`/loans/${id}/repay`, {
    method: "PATCH",
  });

  return result.data;
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function hasSession() {
  return (await SecureStore.getItemAsync(TOKEN_KEY)) !== null;
}