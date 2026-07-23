export interface Notification {
  notificationId: string;

  conversationId: string;

  senderId: string;
  senderName: string;
  senderRole: "Admin" | "Employee";

  receiverId: string;
  receiverName: string;
  receiverRole: "Admin" | "Employee";

  message: string;

  status: "Sent" | "Seen";

  createdAt: string;
  seenAt?: string;

//    conversationId?: string;
  senderEmail?: string;
  receiverEmail?: string;
  replyTo?: string;
//   status?: "Sent" | "Seen";
//   seenAt?: string;
}