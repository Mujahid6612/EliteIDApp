interface BasicInfoData {
  firstName: string;
  lastName: string;
  cellPhone: string;
  email: string;
  plateNumber: string;
  make: string;
  modelYear: string;
  color: string;
}

interface BankInfoData {
  accountName: string;
  phone: string;
  plateNumber: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
}

export const sendBasicInfoEmail = async (
  data: BasicInfoData
): Promise<void> => {
  try {
    const response = await fetch("/api/send-basic-info-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to send email");
    }

    const result = await response.json();
    console.log("Email sent successfully:", result.messageId);
  } catch (error) {
    console.error("Error sending basic info email:", error);
    throw error;
  }
};

export const sendBankInfoEmail = async (data: BankInfoData): Promise<void> => {
  try {
    const response = await fetch("/api/send-bank-info-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to send email");
    }

    const result = await response.json();
    console.log("Email sent successfully:", result.messageId);
  } catch (error) {
    console.error("Error sending bank info email:", error);
    throw error;
  }
};
