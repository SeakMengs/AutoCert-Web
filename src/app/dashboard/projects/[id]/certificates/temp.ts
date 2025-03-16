"use server";

// Server actions for certificate operations
export async function downloadCertificate(
  certificateId: string,
): Promise<void> {
  // In a real implementation, this would fetch the certificate PDF and trigger a download
  console.log(`Downloading certificate with ID: ${certificateId}`);
}

export async function downloadAllCertificates(): Promise<void> {
  // In a real implementation, this would create a ZIP of all certificates and trigger a download
  console.log("Downloading all certificates as ZIP");
}

export async function toggleProjectVisibility(
  isPublic: boolean,
): Promise<void> {
  // In a real implementation, this would update the project visibility in the database
  console.log(
    `Setting project visibility to: ${isPublic ? "public" : "private"}`,
  );
}

export async function generateShareableLink(
  certificateId: string,
): Promise<string> {
  // In a real implementation, this would generate a unique shareable link for the certificate
  return `https://example.com/certificates/share/${certificateId}`;
}

export interface Certificate {
  id: string;
  name: string;
  recipient: string;
  issueDate: string;
  status: "draft" | "issued" | "revoked";
  thumbnailUrl: string;
  pdfUrl?: string;
}

export interface Signatory {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  position?: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

// Mock data for certificates
const mockCertificates: Certificate[] = [
  {
    id: "cert-001",
    name: "Certificate of Completion - Web Development",
    recipient: "John Doe",
    issueDate: "2023-10-15",
    status: "issued",
    thumbnailUrl:
      "https://marketplace.canva.com/EAFy42rCTA0/1/0/1600w/canva-blue-minimalist-certificate-of-achievement-_asVJz8YgJE.jpg",
    pdfUrl: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "cert-002",
    name: "Certificate of Achievement - Data Science",
    recipient: "Jane Smith",
    issueDate: "2023-11-02",
    status: "issued",
    thumbnailUrl:
      "https://marketplace.canva.com/EAFy42rCTA0/1/0/1600w/canva-blue-minimalist-certificate-of-achievement-_asVJz8YgJE.jpg",
    pdfUrl: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "cert-003",
    name: "Certificate of Excellence - UI/UX Design",
    recipient: "Michael Johnson",
    issueDate: "2023-09-28",
    status: "issued",
    thumbnailUrl:
      "https://marketplace.canva.com/EAFy42rCTA0/1/0/1600w/canva-blue-minimalist-certificate-of-achievement-_asVJz8YgJE.jpg",
    pdfUrl: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "cert-004",
    name: "Certificate of Participation - AI Workshop",
    recipient: "Emily Brown",
    issueDate: "2023-12-05",
    status: "draft",
    thumbnailUrl:
      "https://marketplace.canva.com/EAFy42rCTA0/1/0/1600w/canva-blue-minimalist-certificate-of-achievement-_asVJz8YgJE.jpg",
    pdfUrl: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "cert-005",
    name: "Certificate of Completion - Mobile App Development",
    recipient: "David Wilson",
    issueDate: "2023-11-20",
    status: "issued",
    thumbnailUrl:
      "https://marketplace.canva.com/EAFy42rCTA0/1/0/1600w/canva-blue-minimalist-certificate-of-achievement-_asVJz8YgJE.jpg",
    pdfUrl: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "cert-006",
    name: "Certificate of Achievement - Cloud Computing",
    recipient: "Sarah Taylor",
    issueDate: "2023-10-30",
    status: "revoked",
    thumbnailUrl:
      "https://marketplace.canva.com/EAFy42rCTA0/1/0/1600w/canva-blue-minimalist-certificate-of-achievement-_asVJz8YgJE.jpg",
    pdfUrl: "/placeholder.svg?height=800&width=600",
  },
];

// Mock data for signatories
const mockSignatories: Record<string, Signatory[]> = {
  "cert-001": [
    {
      id: "sig-001",
      name: "Dr. Robert Anderson",
      email: "r.anderson@example.com",
      position: "Program Director",
    },
    {
      id: "sig-002",
      name: "Prof. Lisa Martinez",
      email: "l.martinez@example.com",
      position: "Department Head",
    },
  ],
  "cert-002": [
    {
      id: "sig-003",
      name: "Dr. James Wilson",
      email: "j.wilson@example.com",
      position: "Course Instructor",
    },
    {
      id: "sig-004",
      name: "Dr. Emily Clark",
      email: "e.clark@example.com",
      position: "Dean of Faculty",
    },
  ],
  "cert-003": [
    {
      id: "sig-005",
      name: "Prof. Thomas Brown",
      email: "t.brown@example.com",
      position: "Design Lead",
    },
  ],
  "cert-004": [
    {
      id: "sig-006",
      name: "Dr. Sarah Johnson",
      email: "s.johnson@example.com",
      position: "Workshop Facilitator",
    },
    {
      id: "sig-007",
      name: "Prof. Michael Lee",
      email: "m.lee@example.com",
      position: "AI Research Director",
    },
  ],
  "cert-005": [
    {
      id: "sig-008",
      name: "Prof. Jennifer Adams",
      email: "j.adams@example.com",
      position: "Mobile Development Lead",
    },
    {
      id: "sig-009",
      name: "Dr. Daniel White",
      email: "d.white@example.com",
      position: "Technology Director",
    },
  ],
  "cert-006": [
    {
      id: "sig-010",
      name: "Dr. Richard Taylor",
      email: "r.taylor@example.com",
      position: "Cloud Computing Specialist",
    },
  ],
};

// Mock data for activity log
const mockActivityLog: ActivityLogEntry[] = [
  {
    id: "log-001",
    timestamp: "2023-10-14 09:23:15",
    user: "Admin User",
    action: "Requestor invited signatory",
    details:
      "Invited Dr. Robert Anderson (r.anderson@example.com) to sign certificate",
  },
  {
    id: "log-002",
    timestamp: "2023-10-14 11:45:32",
    user: "Dr. Robert Anderson",
    action: "Signatory approved signature",
    details: "Approved signature at position X: 350, Y: 500",
  },
  {
    id: "log-003",
    timestamp: "2023-10-14 14:12:08",
    user: "Admin User",
    action: "Requestor invited signatory",
    details:
      "Invited Prof. Lisa Martinez (l.martinez@example.com) to sign certificate",
  },
  {
    id: "log-004",
    timestamp: "2023-10-14 16:37:45",
    user: "Prof. Lisa Martinez",
    action: "Signatory approved signature",
    details: "Approved signature at position X: 150, Y: 500",
  },
  {
    id: "log-005",
    timestamp: "2023-10-15 08:05:21",
    user: "System",
    action: "Certificate generated",
    details: "Generated certificate for John Doe - Web Development",
  },
  {
    id: "log-006",
    timestamp: "2023-11-01 10:28:17",
    user: "Admin User",
    action: "Certificate field annotated",
    details: "Added recipient name at position X: 250, Y: 300",
  },
  {
    id: "log-007",
    timestamp: "2023-11-01 10:30:42",
    user: "Admin User",
    action: "Certificate field annotated",
    details: "Added course name at position X: 250, Y: 350",
  },
  {
    id: "log-008",
    timestamp: "2023-11-01 10:33:19",
    user: "Admin User",
    action: "Certificate field annotated",
    details: "Added date at position X: 250, Y: 400",
  },
  {
    id: "log-009",
    timestamp: "2023-11-02 09:15:33",
    user: "System",
    action: "Certificate generated",
    details: "Generated certificate for Jane Smith - Data Science",
  },
  {
    id: "log-010",
    timestamp: "2023-11-20 14:22:56",
    user: "System",
    action: "Certificate revoked",
    details: "Revoked certificate for Sarah Taylor - Cloud Computing",
  },
];

// Service functions
export async function getCertificates(): Promise<Certificate[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockCertificates;
}

export async function getSignatories(
): Promise<Signatory[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockSignatories["cert-001"] || [];
}

export async function getActivityLog(): Promise<ActivityLogEntry[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 700));
  return mockActivityLog;
}

export async function exportActivityLogAsPdf(): Promise<boolean> {
  // Simulate PDF generation and download
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In a real implementation, this would generate and trigger download of a PDF
  // For this example, we'll just log to console
  console.log("Activity log exported as PDF");

  return true;
}
