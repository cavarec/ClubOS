// ClubOS — types partagés web/mobile.
// Miroir applicatif (camelCase, DTO) du schéma Prisma (../prisma/schema.prisma).
// Les types générés par `prisma generate` (PascalCase, snake_case DB) sont
// utilisés côté serveur uniquement ; ces types-ci sont ceux qui traversent
// l'API vers les clients web et mobile.

export type TenantType = 'federation' | 'league' | 'committee' | 'club';

export interface Tenant {
  id: string;
  parentId: string | null;
  type: TenantType;
  sportId: string | null;
  name: string;
  slug: string;
  subdomain: string | null;
  customDomain: string | null;
  logoUrl: string | null;
  settings: Record<string, unknown>;
  createdAt: string;
}

export interface Sport {
  id: string;
  slug: string;
  name: string;
  config: Record<string, unknown>;
}

export interface Season {
  id: string;
  tenantId: string;
  label: string;
  startDate: string;
  endDate: string;
}

export type MemberRole =
  | 'player'
  | 'parent'
  | 'coach'
  | 'director'
  | 'club_admin'
  | 'committee_admin'
  | 'league_admin'
  | 'federation_admin';

export interface Membership {
  id: string;
  tenantId: string;
  userId: string;
  role: MemberRole;
  status: 'active' | 'pending' | 'archived';
  joinedAt: string;
}

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  birthDate: string | null;
}

export interface Guardianship {
  id: string;
  guardianId: string;
  childId: string;
}

export interface License {
  id: string;
  tenantId: string;
  profileId: string | null;
  licenseNumber: string;
  category: string | null;
  federationCode: string;
  medicalCertificateExp: string | null;
  source: 'csv_import' | 'sync' | 'api';
}

export interface Team {
  id: string;
  tenantId: string;
  sportId: string;
  seasonId: string;
  name: string;
  category: string;
}

export type TeamMemberRole = 'player' | 'coach' | 'manager';

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
}

export type EventType = 'match' | 'training' | 'other';

export interface ClubEvent {
  id: string;
  teamId: string;
  type: EventType;
  title: string;
  startAt: string;
  endAt: string;
  location: string | null;
  opponent: string | null;
  isHome: boolean | null;
}

export interface Convocation {
  id: string;
  eventId: string;
  createdBy: string;
  aiSuggested: boolean;
  createdAt: string;
}

export type ConvocationResponseStatus = 'pending' | 'present' | 'absent' | 'maybe';

export interface ConvocationResponse {
  convocationId: string;
  userId: string;
  status: ConvocationResponseStatus;
  respondedAt: string | null;
}

export type PresenceStatus = 'present' | 'absent' | 'excused';

export interface Presence {
  eventId: string;
  userId: string;
  status: PresenceStatus;
  recordedBy: string;
  recordedAt: string;
}

export interface Carpool {
  id: string;
  eventId: string;
  driverId: string;
  seatsTotal: number;
  departurePoint: string | null;
  departureTime: string | null;
}

export interface CarpoolBooking {
  id: string;
  carpoolId: string;
  passengerId: string;
  seatsBooked: number;
}

export type PostScope = 'club' | 'team' | 'supervision';

export interface Post {
  id: string;
  tenantId: string;
  teamId: string | null;
  scope: PostScope;
  authorId: string;
  title: string;
  body: string;
  publishedAt: string | null;
}

export interface Document {
  id: string;
  tenantId: string;
  ownerUserId: string | null;
  category: 'certificat_medical' | 'reglement' | 'autre';
  fileUrl: string;
  expiresAt: string | null;
}

export type ProductType = 'cotisation' | 'boutique' | 'billetterie';

export interface Product {
  id: string;
  tenantId: string;
  type: ProductType;
  name: string;
  priceCents: number;
  active: boolean;
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  tenantId: string;
  userId: string;
  productId: string;
  status: OrderStatus;
  amountCents: number;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
}

export interface Installment {
  id: string;
  orderId: string;
  dueDate: string;
  amountCents: number;
  status: 'pending' | 'paid' | 'failed';
}

export interface Sponsor {
  id: string;
  tenantId: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  tier: string | null;
}

export type NotificationChannel = 'push' | 'email' | 'sms';

export interface Notification {
  id: string;
  userId: string;
  tenantId: string | null;
  type: string;
  title: string;
  body: string;
  deepLink: string | null;
  channel: NotificationChannel;
  readAt: string | null;
}
