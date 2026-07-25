--
-- PostgreSQL database dump
--

\restrict UcbYAWiEBsIwmNhGJp7Zg3Z6q5PTwN67yeQTbiL6FtJtJmLYVZpcoAMRSTTg1Of

-- Dumped from database version 17.7 (Debian 17.7-3.pgdg13+1)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: DayOfWeek; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DayOfWeek" AS ENUM (
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY'
);


ALTER TYPE public."DayOfWeek" OWNER TO postgres;

--
-- Name: DiscountStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DiscountStatus" AS ENUM (
    'DRAFT',
    'POSTED',
    'DISMOUNTED',
    'DELETED'
);


ALTER TYPE public."DiscountStatus" OWNER TO postgres;

--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'AMOUNT',
    'FREE_SHIPPING'
);


ALTER TYPE public."DiscountType" OWNER TO postgres;

--
-- Name: ImageStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ImageStatus" AS ENUM (
    'ACTIVE',
    'ARCHIVED'
);


ALTER TYPE public."ImageStatus" OWNER TO postgres;

--
-- Name: NotificationChannel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationChannel" AS ENUM (
    'EMAIL',
    'SMS',
    'PUSH',
    'IN_APP'
);


ALTER TYPE public."NotificationChannel" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'VISIT_REMINDER',
    'VISIT_CONFIRMATION',
    'DISCOUNT_AVAILABLE',
    'NEW_MESSAGE',
    'SYSTEM_ALERT'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: StoreImageType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StoreImageType" AS ENUM (
    'LOGO',
    'STOREFRONT',
    'GALLERY'
);


ALTER TYPE public."StoreImageType" OWNER TO postgres;

--
-- Name: StoreItemCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StoreItemCategory" AS ENUM (
    'CLOTHING',
    'FOOTWEAR',
    'ACCESSORIES',
    'JEWELRY',
    'BEAUTY',
    'HOME',
    'ELECTRONICS',
    'FOOD',
    'OTHER'
);


ALTER TYPE public."StoreItemCategory" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'CUSTOMER',
    'STORE_MANAGER',
    'ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: VisitStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VisitStatus" AS ENUM (
    'SCHEDULED',
    'COMPLETED',
    'MISSED',
    'CANCELLED'
);


ALTER TYPE public."VisitStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO postgres;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    "storeId" text,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    changes jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: CollectionImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CollectionImage" (
    id text NOT NULL,
    "collectionId" text NOT NULL,
    url text NOT NULL,
    description text NOT NULL,
    "order" integer NOT NULL
);


ALTER TABLE public."CollectionImage" OWNER TO postgres;

--
-- Name: Discount; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Discount" (
    id text NOT NULL,
    "storeId" text NOT NULL,
    title text NOT NULL,
    description text,
    code text,
    type public."DiscountType" DEFAULT 'PERCENTAGE'::public."DiscountType" NOT NULL,
    "discountPercent" double precision,
    "discountAmount" double precision,
    "minPurchase" double precision,
    "maxDiscount" double precision,
    "validFrom" timestamp(3) without time zone,
    "validTo" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "maxUses" integer,
    "currentUses" integer DEFAULT 0 NOT NULL,
    "maxUsesPerUser" integer DEFAULT 1,
    "isSingleUse" boolean DEFAULT false NOT NULL,
    "applicableCategories" text[],
    "excludedItems" text[],
    "svdOnly" boolean DEFAULT false NOT NULL,
    "isPublic" boolean DEFAULT true NOT NULL,
    "isStackable" boolean DEFAULT false NOT NULL,
    status public."DiscountStatus" DEFAULT 'DRAFT'::public."DiscountStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Discount" OWNER TO postgres;

--
-- Name: Favorite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Favorite" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "storeId" text,
    "itemId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Favorite" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    data jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "storeId" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "storeId" text NOT NULL,
    "orderNumber" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "paymentStatus" text DEFAULT 'pending'::text NOT NULL,
    "paymentMethod" text,
    subtotal integer NOT NULL,
    tax integer NOT NULL,
    shipping integer NOT NULL,
    discount integer NOT NULL,
    total integer NOT NULL,
    currency text DEFAULT 'EUR'::text NOT NULL,
    "shippingAddress" jsonb,
    "billingAddress" jsonb,
    notes text,
    "trackingNumber" text,
    "shippedAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "itemId" text NOT NULL,
    quantity integer NOT NULL,
    price integer NOT NULL,
    subtotal integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "storeId" text NOT NULL,
    "visitId" text,
    rating integer NOT NULL,
    title text,
    comment text,
    images text[],
    "ownerReply" text,
    "ownerReplyDate" timestamp(3) without time zone,
    "isVerified" boolean DEFAULT false NOT NULL,
    "isHelpful" integer DEFAULT 0 NOT NULL,
    "isReported" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Review" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: Store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Store" (
    id text NOT NULL,
    "managerId" text NOT NULL,
    description text,
    email text,
    website text,
    "logoUrl" text,
    "storefrontUrl" text,
    "phoneCountry" text,
    "phoneArea" text,
    "phoneNumber" text,
    "supportEmail" text,
    country text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip text NOT NULL,
    street text NOT NULL,
    "streetNumber" text NOT NULL,
    floor text,
    apartment text,
    latitude double precision,
    longitude double precision,
    "acceptedCurrencies" text[] DEFAULT ARRAY['EUR'::text],
    categories text[],
    tags text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    rating double precision DEFAULT 0,
    "totalReviews" integer DEFAULT 0 NOT NULL,
    "openingHours" jsonb,
    holidays timestamp(3) without time zone[],
    "facebookUrl" text,
    "instagramUrl" text,
    "twitterUrl" text,
    "youtubeUrl" text,
    "tiktokUrl" text,
    "totalVisits" integer DEFAULT 0 NOT NULL,
    "totalCustomers" integer DEFAULT 0 NOT NULL,
    "totalSales" double precision DEFAULT 0 NOT NULL,
    "monthlyVisits" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "storeName" text NOT NULL,
    "paymentStatus" text DEFAULT 'pending'::text NOT NULL
);


ALTER TABLE public."Store" OWNER TO postgres;

--
-- Name: StoreAnalytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreAnalytics" (
    id text NOT NULL,
    "storeId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "visitsScheduled" integer DEFAULT 0 NOT NULL,
    "visitsCompleted" integer DEFAULT 0 NOT NULL,
    "visitsCancelled" integer DEFAULT 0 NOT NULL,
    "newCustomers" integer DEFAULT 0 NOT NULL,
    "returningCustomers" integer DEFAULT 0 NOT NULL,
    "totalRevenue" double precision DEFAULT 0 NOT NULL,
    "averageOrderValue" double precision DEFAULT 0 NOT NULL,
    "conversionRate" double precision DEFAULT 0 NOT NULL,
    "discountsClaimed" integer DEFAULT 0 NOT NULL,
    "discountsUsed" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StoreAnalytics" OWNER TO postgres;

--
-- Name: StoreCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreCategory" (
    id text NOT NULL,
    "storeId" text NOT NULL,
    title text NOT NULL,
    "order" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StoreCategory" OWNER TO postgres;

--
-- Name: StoreCategoryImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreCategoryImage" (
    id text NOT NULL,
    "categoryId" text NOT NULL,
    "imageUrl" text NOT NULL,
    description text,
    "order" integer NOT NULL,
    status public."ImageStatus" DEFAULT 'ACTIVE'::public."ImageStatus" NOT NULL
);


ALTER TABLE public."StoreCategoryImage" OWNER TO postgres;

--
-- Name: StoreCollection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreCollection" (
    id text NOT NULL,
    "storeId" text NOT NULL,
    title text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StoreCollection" OWNER TO postgres;

--
-- Name: StoreImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreImage" (
    id text NOT NULL,
    "storeId" text NOT NULL,
    "categoryId" text,
    "imageUrl" text NOT NULL,
    "thumbnailUrl" text,
    type public."StoreImageType" NOT NULL,
    title text,
    description text,
    "altText" text,
    "order" integer DEFAULT 0 NOT NULL,
    status public."ImageStatus" DEFAULT 'ACTIVE'::public."ImageStatus" NOT NULL,
    "fileSize" integer,
    width integer,
    height integer,
    "mimeType" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "storeImageCategoryId" text
);


ALTER TABLE public."StoreImage" OWNER TO postgres;

--
-- Name: StoreImageCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreImageCategory" (
    id text NOT NULL,
    "storeId" text NOT NULL,
    name text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StoreImageCategory" OWNER TO postgres;

--
-- Name: StoreItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreItem" (
    id text NOT NULL,
    "storeId" text NOT NULL,
    name text NOT NULL,
    sku text,
    category public."StoreItemCategory" NOT NULL,
    subcategory text,
    description text,
    brand text,
    color text,
    size text,
    price integer,
    "comparePrice" integer,
    "costPrice" integer,
    currency text DEFAULT 'EUR'::text NOT NULL,
    "isTaxIncluded" boolean DEFAULT true NOT NULL,
    "taxRate" double precision DEFAULT 0,
    "stockQuantity" integer DEFAULT 0 NOT NULL,
    "lowStockThreshold" integer DEFAULT 10,
    "isInStock" boolean DEFAULT true NOT NULL,
    "allowBackorder" boolean DEFAULT false NOT NULL,
    weight double precision,
    dimensions jsonb,
    visible boolean DEFAULT true NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "isNew" boolean DEFAULT false NOT NULL,
    "isOnSale" boolean DEFAULT false NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    purchases integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StoreItem" OWNER TO postgres;

--
-- Name: StoreItemDiscount; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreItemDiscount" (
    id text NOT NULL,
    "storeItemId" text NOT NULL,
    "discountId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StoreItemDiscount" OWNER TO postgres;

--
-- Name: StoreItemImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreItemImage" (
    id text NOT NULL,
    "storeItemId" text NOT NULL,
    "imageUrl" text NOT NULL,
    "thumbnailUrl" text,
    "order" integer DEFAULT 0 NOT NULL,
    "altText" text,
    caption text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StoreItemImage" OWNER TO postgres;

--
-- Name: StoreNotification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreNotification" (
    id text NOT NULL,
    "storeId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    data jsonb,
    "actionUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StoreNotification" OWNER TO postgres;

--
-- Name: StoreNotificationPreference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreNotificationPreference" (
    id text NOT NULL,
    "storeId" text NOT NULL,
    "emailEnabled" boolean DEFAULT true NOT NULL,
    "smsEnabled" boolean DEFAULT false NOT NULL,
    "pushEnabled" boolean DEFAULT true NOT NULL,
    "newVisitBookings" boolean DEFAULT true NOT NULL,
    "visitCancellations" boolean DEFAULT true NOT NULL,
    "visitReminders" boolean DEFAULT true NOT NULL,
    "lowStockAlerts" boolean DEFAULT true NOT NULL,
    "systemAlerts" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."StoreNotificationPreference" OWNER TO postgres;

--
-- Name: StoreWeeklyDiscount; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreWeeklyDiscount" (
    id text NOT NULL,
    "storeId" text NOT NULL,
    "dayOfWeek" public."DayOfWeek" NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    type public."DiscountType" DEFAULT 'PERCENTAGE'::public."DiscountType" NOT NULL,
    value double precision NOT NULL,
    "minPurchase" double precision,
    "maxDiscount" double precision,
    code text,
    "applicableCategories" text[],
    "excludedItems" text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "maxUses" integer,
    "totalUses" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StoreWeeklyDiscount" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text,
    "emailVerified" timestamp(3) without time zone,
    role public."UserRole" DEFAULT 'CUSTOMER'::public."UserRole" NOT NULL,
    "phoneCountry" text,
    "phoneArea" text,
    "phoneNumber" text,
    city text,
    state text,
    zip text,
    country text,
    age integer,
    gender text,
    "heightCm" integer,
    "weightKg" integer,
    occupation text,
    "avatarUrl" text,
    "verificationToken" text,
    "verificationTokenExpires" timestamp(3) without time zone,
    "resetPasswordToken" text,
    "resetPasswordTokenExpires" timestamp(3) without time zone,
    "preferredCurrency" text DEFAULT 'EUR'::text,
    language text DEFAULT 'en'::text,
    "marketingOptIn" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserNotificationPreference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserNotificationPreference" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "emailEnabled" boolean DEFAULT true NOT NULL,
    "smsEnabled" boolean DEFAULT false NOT NULL,
    "pushEnabled" boolean DEFAULT true NOT NULL,
    "inAppEnabled" boolean DEFAULT true NOT NULL,
    "visitReminders" boolean DEFAULT true NOT NULL,
    "visitConfirmations" boolean DEFAULT true NOT NULL,
    "discountAlerts" boolean DEFAULT true NOT NULL,
    "marketingEmails" boolean DEFAULT false NOT NULL,
    "reminderLeadTime" integer DEFAULT 24 NOT NULL,
    "confirmationLeadTime" integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."UserNotificationPreference" OWNER TO postgres;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO postgres;

--
-- Name: Visit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Visit" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "storeId" text NOT NULL,
    "discountId" text,
    "qrCodeData" text,
    "scheduledDate" timestamp(3) without time zone NOT NULL,
    "scheduledTime" text NOT NULL,
    "scheduledEnd" timestamp(3) without time zone,
    duration integer,
    notes text,
    "actualStart" timestamp(3) without time zone,
    "actualEnd" timestamp(3) without time zone,
    "checkedIn" boolean DEFAULT false NOT NULL,
    "checkedInAt" timestamp(3) without time zone,
    status public."VisitStatus" DEFAULT 'SCHEDULED'::public."VisitStatus" NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "cancelledAt" timestamp(3) without time zone,
    "missedAt" timestamp(3) without time zone,
    "lastScanAt" timestamp(3) without time zone,
    "reminderSentAt" timestamp(3) without time zone,
    "confirmationSentAt" timestamp(3) without time zone,
    "cancelledBy" text,
    "cancellationReason" text,
    "rescheduledAt" timestamp(3) without time zone,
    "rescheduledBy" text,
    "rescheduleNotes" text,
    "discountUnlocked" boolean DEFAULT false NOT NULL,
    "discountUsed" boolean DEFAULT false NOT NULL,
    "discountCode" text,
    "discountAmount" double precision,
    "discountPercent" double precision,
    "customerNotes" text,
    "specialRequests" text,
    "numberOfPeople" integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "inspirationImageIds" text[],
    "inspirationImages" text[]
);


ALTER TABLE public."Visit" OWNER TO postgres;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, "userId", "storeId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
cmkicbgt30001js04ancp075k	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	VISIT_CANCELLED	Visit	cmki2ljuc0001jq042wl7ogzj	{"reason": "Change of travel plans", "newStatus": "CANCELLED", "cancelledBy": "CUSTOMER", "scheduledDate": "2026-01-18T00:00:00.000Z", "scheduledTime": "11:55", "previousStatus": "SCHEDULED", "hoursUntilVisit": "22.5"}	\N	\N	2026-01-17 13:25:38.392
cmkicbgz70003js04vegjuir2	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	VISIT_CANCELLED	Visit	cmki441ft0001l204q5uulmcc	{"reason": "Change of travel plans", "newStatus": "CANCELLED", "cancelledBy": "CUSTOMER", "scheduledDate": "2026-01-19T00:00:00.000Z", "scheduledTime": "11:40", "previousStatus": "SCHEDULED", "hoursUntilVisit": "46.2"}	\N	\N	2026-01-17 13:25:38.611
cmkicbh350005js04dwpsatvr	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	VISIT_CANCELLED	Visit	cmki4q86b0001js04x9v84fof	{"reason": "Change of travel plans", "newStatus": "CANCELLED", "cancelledBy": "CUSTOMER", "scheduledDate": "2026-01-20T00:00:00.000Z", "scheduledTime": "11:00", "previousStatus": "SCHEDULED", "hoursUntilVisit": "69.6"}	\N	\N	2026-01-17 13:25:38.753
cmkicbh750007js049yde8x9l	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	VISIT_CANCELLED	Visit	cmki860vk0001jx04smp2qnjy	{"reason": "Change of travel plans", "newStatus": "CANCELLED", "cancelledBy": "CUSTOMER", "scheduledDate": "2026-01-24T00:00:00.000Z", "scheduledTime": "12:30", "previousStatus": "SCHEDULED", "hoursUntilVisit": "167.1"}	\N	\N	2026-01-17 13:25:38.897
cmkid3xdh0001l804m3tp5eij	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	VISIT_CANCELLED	Visit	cmkiccfwt0001k304le9lf6u2	{"reason": "Change of plans", "newStatus": "CANCELLED", "cancelledBy": "CUSTOMER", "scheduledDate": "2026-01-18T00:00:00.000Z", "scheduledTime": "23:30", "previousStatus": "SCHEDULED", "hoursUntilVisit": "33.7"}	\N	\N	2026-01-17 13:47:46.23
cmkjsrdfs0003l704g5hnygxc	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	VISIT_CANCELLED	Visit	cmkjsqcam0001l704pe4psqdb	{"reason": "Change of plans", "newStatus": "CANCELLED", "cancelledBy": "CUSTOMER", "scheduledDate": "2026-01-19T00:00:00.000Z", "scheduledTime": "23:00", "previousStatus": "SCHEDULED", "hoursUntilVisit": "33.1"}	\N	\N	2026-01-18 13:53:40.552
\.


--
-- Data for Name: CollectionImage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CollectionImage" (id, "collectionId", url, description, "order") FROM stdin;
cmmktog230001l2049m77m1wd	cmmkoxear0001jl04yrn4th42	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1773159993/bondoutfit/collections/cmmkoxear0001jl04yrn4th42/1773159993369-coll-1-01.webp		0
cmmktqkx20003l20411fm145j	cmmkoxear0001jl04yrn4th42	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1773160093/bondoutfit/collections/cmmkoxear0001jl04yrn4th42/1773160093138-coll-1-02.webp		1
cmmktubhf0003l204viwtwgy1	cmmktsz2l0001l204qugf2oam	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1773160268/bondoutfit/collections/cmmktsz2l0001l204qugf2oam/1773160267956-spring-02-01.jpg		0
cmmktubyz0005l204r7tqeq49	cmmktsz2l0001l204qugf2oam	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1773160268/bondoutfit/collections/cmmktsz2l0001l204qugf2oam/1773160268595-spring-02-02.jpg		1
\.


--
-- Data for Name: Discount; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Discount" (id, "storeId", title, description, code, type, "discountPercent", "discountAmount", "minPurchase", "maxDiscount", "validFrom", "validTo", "isActive", "maxUses", "currentUses", "maxUsesPerUser", "isSingleUse", "applicableCategories", "excludedItems", "svdOnly", "isPublic", "isStackable", status, "createdAt", "updatedAt") FROM stdin;
cmkv45scr0005js04nj2s73ex	cmkgtzpno0002jo04ueqlfrss	Loyalty Scheduled Visit Discount (LSVD)	This is for customers who have completed three or more visits that resulted in a purchase.	\N	PERCENTAGE	20	\N	\N	\N	2026-01-26 00:00:00	2026-12-31 00:00:00	t	\N	0	1	f	\N	\N	f	t	f	POSTED	2026-01-26 11:58:16.78	2026-01-26 11:58:29.198
cmki2ekqg0001jx04ez2ekbk1	cmkgtzpno0002jo04ueqlfrss	Group Scheduled Visit Discount	This a minimum of 2 potential customers visiting. In our store, potential customers are considered females of 14 years or older.	\N	PERCENTAGE	15	\N	\N	\N	2026-01-18 00:00:00	2026-12-31 00:00:00	f	\N	0	1	f	\N	\N	f	t	f	DELETED	2026-01-17 08:48:07.288	2026-01-26 11:03:07.407
cmkgxarng0001ib04n0y1ggdr	cmkgtzpno0002jo04ueqlfrss	Sceduled Visit Discount (SVD)	This is the standard SVD for all customers who show up at the scheduled time and date of their choice.	\N	PERCENTAGE	10	\N	\N	\N	2026-01-16 00:00:00	2026-12-31 00:00:00	f	\N	0	1	f	{}	{}	f	t	f	DELETED	2026-01-16 13:37:25.372	2026-01-26 11:03:10.512
cmkv3w7330001js04pvxymq7m	cmkgtzpno0002jo04ueqlfrss	Standard Scheduled Visit Discount (SSVD)	This is the classical SVD for all customers who show up at the scheduled time and day of their choice.	\N	PERCENTAGE	10	\N	\N	\N	2026-02-01 00:00:00	2026-12-31 00:00:00	t	\N	0	1	f	\N	\N	f	t	f	POSTED	2026-01-26 11:50:49.311	2026-01-26 11:50:55.353
cmkv401cb0003js04u3o0455a	cmkgtzpno0002jo04ueqlfrss	Group Scheduled Visit Discount (GSVD)	This a minimum of 2 potential customers visiting. In our store, potential customers are considered females of 14 years or older.\n15% OFF	\N	PERCENTAGE	15	\N	\N	\N	2026-01-26 00:00:00	2026-12-31 00:00:00	t	\N	0	1	f	\N	\N	f	t	f	POSTED	2026-01-26 11:53:48.492	2026-01-26 11:58:27.907
\.


--
-- Data for Name: Favorite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Favorite" (id, "userId", "storeId", "itemId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "userId", title, message, type, data, "createdAt", read, "storeId", "updatedAt") FROM stdin;
cmkicbh960009js04jztwy5lx	cmkgtzpjq0000jo0413mozlno	4 Visit(s) Cancelled	A customer cancelled 4 scheduled visit(s) to Belles Femmes	VISIT_CANCELLED	{"reason": "Change of travel plans", "storeId": "cmkgtzpno0002jo04ueqlfrss", "cancelledVisitIds": ["cmki2ljuc0001jq042wl7ogzj", "cmki441ft0001l204q5uulmcc", "cmki4q86b0001js04x9v84fof", "cmki860vk0001jx04smp2qnjy"], "cancelledVisitCount": 4}	2026-01-17 13:25:38.971	f	\N	2026-01-17 13:25:38.971
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "userId", "storeId", "orderNumber", status, "paymentStatus", "paymentMethod", subtotal, tax, shipping, discount, total, currency, "shippingAddress", "billingAddress", notes, "trackingNumber", "shippedAt", "deliveredAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "itemId", quantity, price, subtotal, "createdAt") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Review" (id, "userId", "storeId", "visitId", rating, title, comment, images, "ownerReply", "ownerReplyDate", "isVerified", "isHelpful", "isReported", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: Store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Store" (id, "managerId", description, email, website, "logoUrl", "storefrontUrl", "phoneCountry", "phoneArea", "phoneNumber", "supportEmail", country, city, state, zip, street, "streetNumber", floor, apartment, latitude, longitude, "acceptedCurrencies", categories, tags, "isActive", "isVerified", rating, "totalReviews", "openingHours", holidays, "facebookUrl", "instagramUrl", "twitterUrl", "youtubeUrl", "tiktokUrl", "totalVisits", "totalCustomers", "totalSales", "monthlyVisits", "createdAt", "updatedAt", "storeName", "paymentStatus") FROM stdin;
cmkgtzpno0002jo04ueqlfrss	cmkgtzpjq0000jo0413mozlno	We are a women’s fashion boutique offering carefully curated collections defined by refined design, quality fabrics, and thoughtful detail. Our focus is on timeless silhouettes with a contemporary sensibility, allowing each piece to be worn with ease, confidence, and individuality.	horistics@outlook.com	https://examplebellesfemmes.com	\N	\N	+45	-	23950606	\N	USA	Salem	Oregon	97317	Happiness	86	Ground	\N	\N	\N	{EUR}	{"Women's Fashion Boutique"}	\N	t	f	0	0	[{"day": "Monday", "open": "11:00", "close": "22:00", "closed": false}, {"day": "Tuesday", "open": "11:00", "close": "22:00", "closed": false}, {"day": "Wednesday", "open": "09:00", "close": "18:00", "closed": false}, {"day": "Thursday", "open": "09:00", "close": "18:00", "closed": false}, {"day": "Friday", "open": "09:00", "close": "18:00", "closed": false}, {"day": "Saturday", "open": "10:00", "close": "16:00", "closed": false}, {"day": "Sunday", "open": "", "close": "", "closed": true}]	\N	\N	\N	\N	\N	\N	0	0	0	\N	2026-01-16 12:04:50.724	2026-01-17 08:38:25.082	Belles Femmes	pending
\.


--
-- Data for Name: StoreAnalytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreAnalytics" (id, "storeId", date, "visitsScheduled", "visitsCompleted", "visitsCancelled", "newCustomers", "returningCustomers", "totalRevenue", "averageOrderValue", "conversionRate", "discountsClaimed", "discountsUsed", "createdAt") FROM stdin;
\.


--
-- Data for Name: StoreCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreCategory" (id, "storeId", title, "order", "createdAt") FROM stdin;
cmki23nn70001kz049zhas6t6	cmkgtzpno0002jo04ueqlfrss	Day Dresses	1	2026-01-17 08:39:37.843
cmki255vu0009kz04z8mo4wpy	cmkgtzpno0002jo04ueqlfrss	Evening Dresses	2	2026-01-17 08:40:48.138
cmki26mxb000hkz04k1tzo5kd	cmkgtzpno0002jo04ueqlfrss	Cocktail Dresses	3	2026-01-17 08:41:56.879
cmki296bx000pkz04fpqc7v33	cmkgtzpno0002jo04ueqlfrss	Mini Dresses	0	2026-01-17 08:43:55.342
\.


--
-- Data for Name: StoreCategoryImage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreCategoryImage" (id, "categoryId", "imageUrl", description, "order", status) FROM stdin;
cmki2468h0005kz04b97k6cvk	cmki23nn70001kz049zhas6t6	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639201/stores/horistics%40outlook.com/null/nbvdbyfeh7itgucgmaoi.webp	Resourceful	1	ACTIVE
cmki24n9b0007kz045tg30rx4	cmki23nn70001kz049zhas6t6	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639223/stores/horistics%40outlook.com/null/cincgspke0ryysrtbh2g.jpg	Making a statement	2	ACTIVE
cmki25fsq000bkz04za79v8sc	cmki255vu0009kz04z8mo4wpy	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639259/stores/horistics%40outlook.com/null/pvzhuqzajpbify1srzpw.avif	Purposeful	0	ACTIVE
cmki25u45000dkz04799aag54	cmki255vu0009kz04z8mo4wpy	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639278/stores/horistics%40outlook.com/null/lk4dgjo8quokoo8stxno.avif	Promising	1	ACTIVE
cmki264h2000fkz04vkau6fr8	cmki255vu0009kz04z8mo4wpy	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639292/stores/horistics%40outlook.com/null/nzkq9g8qljihs948fnx0.avif	Confident	2	ACTIVE
cmki26uoo000jkz046rrcd663	cmki26mxb000hkz04k1tzo5kd	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639326/stores/horistics%40outlook.com/null/uy3gvs3d3rgqpixg3s8l.jpg	Imposing	0	ACTIVE
cmki27h0n000lkz04hwavsex4	cmki26mxb000hkz04k1tzo5kd	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639355/stores/horistics%40outlook.com/null/z8obsdjcuyiqm6tmzohc.jpg	Inspiring	1	ACTIVE
cmki28eml000nkz04jpz5qani	cmki26mxb000hkz04k1tzo5kd	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639398/stores/horistics%40outlook.com/null/vpkn0a0cejdv3ft9g6iq.jpg	Natural	2	ACTIVE
cmki29ryq000rkz049e1za27k	cmki296bx000pkz04fpqc7v33	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639462/stores/horistics%40outlook.com/null/cajnegsbxxh7riqxtvf5.webp	Daring	0	ACTIVE
cmki2a9jt000tkz04qdddh4xt	cmki296bx000pkz04fpqc7v33	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639485/stores/horistics%40outlook.com/null/pgswpcyfy4o8lwqyvhhu.jpg	Present	1	ACTIVE
cmki2aw14000vkz04lgfjoh86	cmki296bx000pkz04fpqc7v33	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639514/stores/horistics%40outlook.com/null/ioeenrcmp9hji2pg61az.jpg	Demanding	2	ACTIVE
cmki23tsc0003kz0450lo034t	cmki23nn70001kz049zhas6t6	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639185/stores/horistics%40outlook.com/null/goj8mi8g5jbf21shdv1o.jpg	Carefree	0	ACTIVE
\.


--
-- Data for Name: StoreCollection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreCollection" (id, "storeId", title, "createdAt") FROM stdin;
cmmkoxear0001jl04yrn4th42	cmkgtzpno0002jo04ueqlfrss	Summer Clothing Collection	2026-03-10 14:13:33.988
cmmktsz2l0001l204qugf2oam	cmkgtzpno0002jo04ueqlfrss	Spring Clothing Collection	2026-03-10 16:30:05.709
\.


--
-- Data for Name: StoreImage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreImage" (id, "storeId", "categoryId", "imageUrl", "thumbnailUrl", type, title, description, "altText", "order", status, "fileSize", width, height, "mimeType", "createdAt", "updatedAt", "storeImageCategoryId") FROM stdin;
cmki216jt0001l704siuipvbz	cmkgtzpno0002jo04ueqlfrss	\N	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639061/stores/horistics%40outlook.com/logo/iy63l4vx22unuwytpxxk.png	\N	LOGO	Store Logo	\N	\N	0	ACTIVE	\N	\N	\N	\N	2026-01-17 08:37:42.377	2026-01-17 08:37:42.377	\N
cmki21cp30003l704ejfp3nr0	cmkgtzpno0002jo04ueqlfrss	\N	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639069/stores/horistics%40outlook.com/storefront/lgpw6pvmcxwieivio14i.jpg	\N	STOREFRONT	Storefront	\N	\N	0	ACTIVE	\N	\N	\N	\N	2026-01-17 08:37:50.343	2026-01-17 08:37:50.343	\N
cmki21loz0005l704waf7hdqf	cmkgtzpno0002jo04ueqlfrss	\N	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639080/stores/horistics%40outlook.com/gallery/av6ny8k3qps8jdgybrwz.jpg	\N	GALLERY	Gallery Image	\N	\N	0	ACTIVE	\N	\N	\N	\N	2026-01-17 08:38:02.004	2026-01-17 08:38:02.004	\N
cmki21t5b0007l70457bquwjx	cmkgtzpno0002jo04ueqlfrss	\N	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639091/stores/horistics%40outlook.com/gallery/cwdjt7z9nui3tsbknpt7.jpg	\N	GALLERY	Gallery Image	\N	\N	1	ACTIVE	\N	\N	\N	\N	2026-01-17 08:38:11.663	2026-01-17 08:38:11.663	\N
cmki21ynt0009l7045va1ibtl	cmkgtzpno0002jo04ueqlfrss	\N	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1768639098/stores/horistics%40outlook.com/gallery/ortndmlc1ishs0weusuu.avif	\N	GALLERY	Gallery Image	\N	\N	2	ACTIVE	\N	\N	\N	\N	2026-01-17 08:38:18.809	2026-01-17 08:38:18.809	\N
\.


--
-- Data for Name: StoreImageCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreImageCategory" (id, "storeId", name, "order", "isActive", "createdAt") FROM stdin;
\.


--
-- Data for Name: StoreItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreItem" (id, "storeId", name, sku, category, subcategory, description, brand, color, size, price, "comparePrice", "costPrice", currency, "isTaxIncluded", "taxRate", "stockQuantity", "lowStockThreshold", "isInStock", "allowBackorder", weight, dimensions, visible, featured, "isNew", "isOnSale", views, purchases, "createdAt", "updatedAt") FROM stdin;
cmmkvi6y60001jr04hqpl0ou4	cmkgtzpno0002jo04ueqlfrss	First Item	TS-BLK-S	CLOTHING	Casual	Comfortable	TOP LEAGUE	Blue	Large	18000	23000	\N	EUR	t	0	3	10	t	f	\N	null	t	f	f	f	0	0	2026-03-10 17:17:41.935	2026-03-10 17:33:00.682
\.


--
-- Data for Name: StoreItemDiscount; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreItemDiscount" (id, "storeItemId", "discountId", "createdAt") FROM stdin;
\.


--
-- Data for Name: StoreItemImage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreItemImage" (id, "storeItemId", "imageUrl", "thumbnailUrl", "order", "altText", caption, "createdAt") FROM stdin;
cmmkw1ryj0003kt04w24h9b1z	cmmkvi6y60001jr04hqpl0ou4	https://res.cloudinary.com/dmsfvs0c5/image/upload/v1773163975/bondoutfit/items/cmmkvi6y60001jr04hqpl0ou4/1773163974841-item001.webp	\N	0	\N	\N	2026-03-10 17:32:55.628
\.


--
-- Data for Name: StoreNotification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreNotification" (id, "storeId", title, message, type, "isRead", data, "actionUrl", "createdAt") FROM stdin;
\.


--
-- Data for Name: StoreNotificationPreference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreNotificationPreference" (id, "storeId", "emailEnabled", "smsEnabled", "pushEnabled", "newVisitBookings", "visitCancellations", "visitReminders", "lowStockAlerts", "systemAlerts") FROM stdin;
\.


--
-- Data for Name: StoreWeeklyDiscount; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreWeeklyDiscount" (id, "storeId", "dayOfWeek", "startTime", "endTime", type, value, "minPurchase", "maxDiscount", code, "applicableCategories", "excludedItems", "isActive", "maxUses", "totalUses", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, "emailVerified", role, "phoneCountry", "phoneArea", "phoneNumber", city, state, zip, country, age, gender, "heightCm", "weightKg", occupation, "avatarUrl", "verificationToken", "verificationTokenExpires", "resetPasswordToken", "resetPasswordTokenExpires", "preferredCurrency", language, "marketingOptIn", "createdAt", "updatedAt", "firstName", "lastName") FROM stdin;
cmkgq2zeg0000ld04dejam16l	horistics@gmail.com	$2b$12$GsN7Nm92fYXvBl0LXn5WJ.jncBoMVPkuJ4juO0nn0gkaHUClQRJD6	2026-01-16 10:15:42.396	CUSTOMER	\N	\N	27134483	Salem	Oregon	97317	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	EUR	en	f	2026-01-16 10:15:24.857	2026-07-21 08:45:53.238	Isidoros	Parlamas
cmkgtzpjq0000jo0413mozlno	horistics@outlook.com	$2b$12$J4o14tsVzwUzbwVFX2q6Ne3uJuFaWDAQt8fwqjhRd8QL7J2fld22W	2026-01-16 12:04:59.802	STORE_MANAGER	+45	-	23950606	Salem	Oregon	97317	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	EUR	en	f	2026-01-16 12:04:50.583	2026-07-21 08:48:27.114	Claire	Dubois
\.


--
-- Data for Name: UserNotificationPreference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserNotificationPreference" (id, "userId", "emailEnabled", "smsEnabled", "pushEnabled", "inAppEnabled", "visitReminders", "visitConfirmations", "discountAlerts", "marketingEmails", "reminderLeadTime", "confirmationLeadTime") FROM stdin;
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: Visit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Visit" (id, "userId", "storeId", "discountId", "qrCodeData", "scheduledDate", "scheduledTime", "scheduledEnd", duration, notes, "actualStart", "actualEnd", "checkedIn", "checkedInAt", status, "completedAt", "cancelledAt", "missedAt", "lastScanAt", "reminderSentAt", "confirmationSentAt", "cancelledBy", "cancellationReason", "rescheduledAt", "rescheduledBy", "rescheduleNotes", "discountUnlocked", "discountUsed", "discountCode", "discountAmount", "discountPercent", "customerNotes", "specialRequests", "numberOfPeople", "createdAt", "updatedAt", "inspirationImageIds", "inspirationImages") FROM stdin;
cmki441ft0001l204q5uulmcc	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	cmkgxarng0001ib04n0y1ggdr	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOXSURBVO3BQW4bSQAEwawG///lXB32UKcGiKFkW6iI+IWZ/x1mymGmHGbKYaYcZsphphxmymGmHGbKYaYcZsphphxmymGmHGbKi4eS8JNUnkhCU7lJQlNpSWgqLQk/SeWJw0w5zJTDTHnxYSqflIR3JOFG5R0qLQlN5R0qn5SETzrMlMNMOcyUF98sCe9QeUcSmso7ktBUWhJuktBU3pGEd6h8p8NMOcyUw0x58csk4UalqbQkNJWWhN/sMFMOM+UwU178cio3SWgqLQlN5Tc7zJTDTDnMlBffTOVPSkJTeSIJTeUJlb/JYaYcZsphprz4sCT8SSotCZ+k0pLQVG6S8Dc7zJTDTDnMlBcPqfxLktBU3pGEpnKj8i85zJTDTDnMlPiFB5LQVFoSPknlOyXhCZWWhE9S+U6HmXKYKYeZ8uIhlZaEptKS0FSeSEJTeUKlJaGp3CShqbwjCX/SYaYcZsphpsQvPJCEpvJEEm5UbpLwhEpLwo3KTRKayjuS8A6VJw4z5TBTDjPlxYcloam0JDSVpnKThBuVloSm8oTKE0loKjcqLQnf6TBTDjPlMFNePKRyk4SbJLxD5ZOS8I4k3Ki8IwlPqHzSYaYcZsphprx4KAk3KjdJuFFpSWgqLQnvULlJQlO5SUJTaUloKi0JNyrf6TBTDjPlMFPiFx5IQlN5RxL+JiotCTcqN0loKi0JTeUmCTcqTxxmymGmHGbKi7+MyhNJaCotCU3liSQ0lZskNJWWhKZyo/JJh5lymCmHmfLiL5eEptKS0FRaEm6S8A6VloSWhHckoam0JDSVloSm8sRhphxmymGmvHhI5QmVG5VPUmlJuFFpSbhReUcSblRuVD7pMFMOM+UwU+IXHkjCT1L5SUloKi0JTaUloam0JNyotCTcqDxxmCmHmXKYKS8+TOWTknCThKZyk4QblabyhMq/5DBTDjPlMFNefLMkvEPlk5LQVFoSWhKeSMITKi0JTeU7HWbKYaYcZsqLXyYJN0loKi0JTeWJJDSVloQblZaEG5UnDjPlMFMOM+XFL6PyhEpLwo1KS0JTaUloKi0JTaWptCR80mGmHGbKYaa8+GYq30mlJeEJlRuVloSm0pLwLznMlMNMOcyUFx+WhJ+UhBuVmyS0JNwkoam8Q+VGpSXhJx1mymGmHGZK/MLM/w4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlP+cDpQMs5UfcAAAAAElFTkSuQmCC	2026-01-19 00:00:00	11:40	\N	\N	\N	\N	\N	f	\N	CANCELLED	\N	2026-01-17 13:25:38.247	\N	\N	\N	\N	CUSTOMER	Change of travel plans	\N	\N	\N	f	f	\N	\N	\N	\N	\N	1	2026-01-17 09:35:54.953	2026-01-17 13:25:38.536	\N	\N
cmki860vk0001jx04smp2qnjy	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	cmkgxarng0001ib04n0y1ggdr	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOYSURBVO3BS45jSQIDQWdA97+yTy4aGK4CEJ6U1R+axR/M/OUwUw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlMFMOM+UwUw4z5TBTXjyUhN+k8kQSmspNEppKS0JTaUn4TSpPHGbKYaYcZsqLD1P5pCS8IwlN5SYJNyotCU3lHSqflIRPOsyUw0w5zJQXX5aEd6i8IwlNpSXhRuUmCTdJaCrvSMI7VL7pMFMOM+UwU178yyShqdwkYf7vMFMOM+UwU178yyXhRqUloan8lxxmymGmHGbKiy9T+ZNUWhJuVFoSblSeUPk7OcyUw0w5zJQXH5aEP0mlJaGptCQ0lRuVloSmcpOEv7PDTDnMlMNMiT/4B0vCO1TekYQblX+Tw0w5zJTDTIk/eCAJTaUl4ZNUvikJT6i0JHySyjcdZsphphxmyouHVFoSblSeSMKNSktCU7lRaUloKjdJaCrvSMKfdJgph5lymCnxBw8k4UalJaGp3CThRuU3JaGp3CThHSotCe9QeeIwUw4z5TBTXjykcpOEptKScKPSktCScKPSktBUfpNKS8KNSkvCNx1mymGmHGbKi4eS8ITKTRJuVJ5Iwo1KU2lJaCpPJOEdKp90mCmHmXKYKS8+TKUloSWhqbQkNJWWhJaEptKS0FTekYSmcpOEptKS0FRaEm5UvukwUw4z5TBT4g8eSEJTuUnCJ6m8IwnvUGlJaCo3SWgqLQlN5SYJNypPHGbKYaYcZsqLL0tCU2lJaCpPJOEdKu9QeSIJTaUloancqHzSYaYcZsphprz4w1RuktBUblRaEm6S8A6VloQnktBUWhKaSktCU3niMFMOM+UwU+IP/sGS0FRaEppKS0JTaUl4h8o7kvAOlW86zJTDTDnMlPiDB5Lwm1T+TpLQVFoSmkpLwo1KS8KNyhOHmXKYKYeZ8uLDVD4pCTdJuFG5SUJTaUloKu9Q+Sc5zJTDTDnMlBdfloR3qDyh0pJwo9KScJOEmyQ8odKS0FS+6TBTDjPlMFNe/Mskoam0JLxD5YkkPKHSknCj8sRhphxmymGmvPiPUWlJuEnCjUpLQlNpSWgqLQk3Ki0Jn3SYKYeZcpgpL75M5ZtUbpLwDpV3JKGptCQ0lXeo/KbDTDnMlMNMefFhSfhNSWgqTyThHSqfpNKS8JsOM+UwUw4zJf5g5i+HmXKYKYeZcpgph5lymCmHmXKYKYeZcpgph5lymCmHmXKYKYeZ8j9gAqEHadOtSgAAAABJRU5ErkJggg==	2026-01-24 00:00:00	12:30	\N	\N	\N	\N	\N	f	\N	CANCELLED	\N	2026-01-17 13:25:38.247	\N	\N	\N	\N	CUSTOMER	Change of travel plans	\N	\N	\N	f	f	\N	\N	\N	\N	\N	1	2026-01-17 11:29:26.001	2026-01-17 13:25:38.826	\N	\N
cmki4q86b0001js04x9v84fof	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	cmkgxarng0001ib04n0y1ggdr	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAN6SURBVO3BQY7kSAIDQWdA//+ybx3mwJMAQZk10700iz+Y+cdhphxmymGmHGbKYaYcZsphphxmymGmHGbKYaYcZsphphxmymGmXLyUhN+kcicJTeWJJNxRaUloKi0Jv0nljcNMOcyUw0y5+DCVT0rCG0loKi0JTeVOEprKEyqflIRPOsyUw0w5zJSLL0vCEypPJKGp3ElCU3kjCU3liSQ8ofJNh5lymCmHmXLxl0nCHZWWhDsq/08OM+UwUw4z5WJuJaGp/M0OM+UwUw4z5eLLVH6Tyhsqd5LQVN5Q+S85zJTDTDnMlIsPS8J/SRKayhNJaCotCU3lThL+yw4z5TBTDjPl4iWVP5nKE0loKndU/iSHmXKYKYeZEn/wQhKaSkvCJ6ncSUJTuZOET1JpSfgklW86zJTDTDnMlPiDX5SEpvJEEr5JpSWhqdxJQlN5Igl3VL7pMFMOM+UwU+IPXkhCU2lJaCpPJOFPotKS0FRaEppKS8ITKm8cZsphphxmysWXqbyh0pJwR+VPonJHpSXhmw4z5TBTDjPl4iWVJ5LwhsoTSWgqLQl3VFoS7qg8kYQ3VD7pMFMOM+UwU+IPXkhCU2lJaCpvJKGptCQ0lSeScEelJeGOSktCU2lJuKPyTYeZcpgph5ly8S9LQlNpSWgqTyThCZU7SWgqd5LQVFoSmsqdJNxReeMwUw4z5TBTLr5MpSXhThKayp0k3FFpSWgqT6i8kYSm0pLQVO6ofNJhphxmymGmXHxZEppKS8KdJHxTEu6o3EnCG0loKi0JTaUloam8cZgph5lymCnxB3+wJDSVloSm0pLQVFoSnlB5IglN5d90mCmHmXKYKRcvJeE3qTSVOyqfpNKScCcJTeVOEppKS8IdlTcOM+UwUw4z5eLDVD4pCXeS8IbKHZU3VJ5Q+TcdZsphphxmysWXJeEJlTdUWhKaSkvCJyXhk5LQVL7pMFMOM+UwUy7+ciotCU3lm5LwRBKaSkvCHZU3DjPlMFMOM+XiL5OEptJU7iThCZWWhKbySSotCZ90mCmHmXKYKRdfpvJNKk8koak0lSeS0FRaEprKnSQ0ld90mCmHmXKYKRcfloTflIQ7KneS8IbKG0loKi0Jv+kwUw4z5TBT4g9m/nGYKYeZcpgph5lymCmHmXKYKYeZcpgph5lymCmHmXKYKYeZcpgp/wOS65PzTX7SrgAAAABJRU5ErkJggg==	2026-01-20 00:00:00	11:00	\N	\N	\N	\N	\N	f	\N	CANCELLED	\N	2026-01-17 13:25:38.247	\N	\N	\N	\N	CUSTOMER	Change of travel plans	\N	\N	\N	f	f	\N	\N	\N	\N	\N	1	2026-01-17 09:53:10.115	2026-01-17 13:25:38.682	\N	\N
cmki2ljuc0001jq042wl7ogzj	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	cmkgxarng0001ib04n0y1ggdr	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOCSURBVO3BQa7cVgADwe4H3f/KjBdZcCVA0My347DK/MLMvw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPl4iWVn5SEJ1SeSEJTaUl4QuUnJeGNw0w5zJTDTLn4sCR8ksoTKk8koam0JDSVloQnkvBJKp90mCmHmXKYKRdfpvJEEp5QuZOEOyotCU+otCQ8ofJEEr7pMFMOM+UwUy7+MkloKneS0FT+zw4z5TBTDjPl4n8mCXeS0FRaEv5mh5lymCmHmXLxZUn4SSp3VN5QaUl4Iwl/ksNMOcyUw0y5+DCV3ykJTaUloam0JDSVloSm0pJwR+VPdpgph5lymCkXLyXhT6LyTSotCXeS8F9ymCmHmXKYKeYXXlBpSWgqn5SEOypPJKGpvJGEpvJJSfimw0w5zJTDTLn4MJU7SWgqLQl3VJ5IQlNpKneS8IRKS8ITKr/TYaYcZsphpphfeEGlJeENlTtJuKNyJwlPqDyRhKbyRBKayhNJeOMwUw4z5TBTLv5wSWgqPykJTaUl4YkkPJGEpvJNh5lymCmHmXLxYSp3ktBU7qg8kYSm0lSeSMIdlZaEJ1TeSMInHWbKYaYcZsrFhyWhqdxJwjcl4Q2VloSm0lRaEppKS0JTuZOEbzrMlMNMOcyUix+mcicJTaUl4Q2VN1RaEu6oPJGEOyp3kvDGYaYcZsphplx8WRLuqNxJQlN5Igl3knBHpSXhm1RaEu4k4ZMOM+UwUw4z5eLLVO4k4Y5KS0JTeUPlDZU3VFoSmkpLQlNpSXjjMFMOM+UwU8wv/IeptCQ8oXInCU3lThKeULmThJ90mCmHmXKYKRcvqfykJLQkNJU7SXhCpSWhqdxRaUl4QuWJJLxxmCmHmXKYKRcfloRPUrmjcicJTeVOEprKG0l4Igl3VL7pMFMOM+UwUy6+TOWJJLyRhKbyhModlTsqb6jcScI3HWbKYaYcZsrFXy4JTaUl4ZtUnkhCU2kqd5LwxmGmHGbKYaZc/GVU7iShqbyRhKbSktBUWhKaSkvCHZVPOsyUw0w5zJSLL0vCNyXhjkpTuZOEptKS0FRaEppKS0JTaUn4nQ4z5TBTDjPl4sNUfpLKG0loKndUWhI+SeV3OsyUw0w5zBTzCzP/OsyUw0w5zJTDTDnMlMNMOcyUw0w5zJTDTDnMlMNMOcyUw0w5zJR/AGVicT0+n++1AAAAAElFTkSuQmCC	2026-01-18 00:00:00	11:55	\N	\N	\N	\N	\N	f	\N	CANCELLED	\N	2026-01-17 13:25:38.247	\N	\N	\N	\N	CUSTOMER	Change of travel plans	\N	\N	\N	f	f	\N	\N	\N	\N	\N	1	2026-01-17 08:53:32.724	2026-01-17 13:25:38.249	\N	\N
cmkiccfwt0001k304le9lf6u2	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	cmkgxarng0001ib04n0y1ggdr	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAN8SURBVO3BQa5bRwADweZA979yx4ssuBrgQdK347Aq/sLMvw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlxZuS8JNUbpLQVFoSnlC5SUJTaUn4SSrvOMyUw0w5zJQXH6bySUl4QqUloak8kYQblSdUPikJn3SYKYeZcpgpL74sCU+oPJGEJ5Jwo9JUWhJaEprKE0l4QuWbDjPlMFMOM+XFX0alJaGp3CTh/+wwUw4z5TBTXvxlkvBEEprK/9lhphxmymGmvPgylZ+k0pLwjiTcqLxD5U9ymCmHmXKYKS8+LAl/M5WWhKZyk4Q/2WGmHGbKYaa8eJPKf5nKE0loKjcq/yWHmXKYKYeZEn/hDUloKi0Jn6Ryk4RPUmlJuFFpSfgklW86zJTDTDnMlBcfloR3qNwkoancqLQkNJWWhJaEpnKThKbyRBJ+p8NMOcyUw0x58cNUWhJaEp5Iwiep3CThRqUloancqLQktCTcqLzjMFMOM+UwU+Iv/EGS0FQ+KQk3Ki0JTeWJJNyoPJGEG5V3HGbKYaYcZkr8hQ9Kwo3KE0loKu9IwjeptCR8k8onHWbKYaYcZsqLNyWhqbQktCQ8odKS0FRuktBUbpLQVJ5IQlNpSWgqLQk3Kt90mCmHmXKYKS++TOUdSbhJwo1KS8KNSkvCEyotCTdJaCo3SbhRecdhphxmymGmvPjNktBUmso3qdyofJPKO1Q+6TBTDjPlMFNe/GYqLQk3Kp+UhCdUWhLekYQnVFoSmso7DjPlMFMOMyX+wn9YEppKS0JTaUloKjdJuFF5Igk3Kj/pMFMOM+UwU168KQk/SaWptCQ0lSeScKPSknCThKZyo9KS8ITKOw4z5TBTDjPlxYepfFISbpLwRBJuVD5J5R0qLQnfdJgph5lymCkvviwJT6h8k8pNEppKS8JNEt6RhBuVbzrMlMNMOcyUF/8zSbhRaUloKk8k4R0qLQk3Ku84zJTDTDnMlBd/GZUblZsk3CShqbQkNJWWhKZyk4Sm0pLwSYeZcpgph5ny4stUvkmlJeFG5UbliSQ0lZaEptKS0FSayk86zJTDTDnMlBcfloSflISm0pLwRBKeUHkiCU2lJeF3OsyUw0w5zJT4CzP/OsyUw0w5zJTDTDnMlMNMOcyUw0w5zJTDTDnMlMNMOcyUw0w5zJR/AG16gRUw8L+PAAAAAElFTkSuQmCC	2026-01-18 00:00:00	23:30	\N	\N	\N	\N	\N	f	\N	CANCELLED	\N	2026-01-17 13:47:45.602	\N	\N	\N	\N	CUSTOMER	Change of plans	\N	\N	\N	f	f	\N	\N	\N	\N	\N	1	2026-01-17 13:26:23.885	2026-01-17 13:47:45.603	\N	\N
cmkjsqcam0001l704pe4psqdb	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	cmki2ekqg0001jx04ez2ekbk1	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOWSURBVO3BQY4jSQIDQXpA//+ybx3mwFMACUnVM700wx+Z+cfJTDmZKScz5WSmnMyUk5lyMlNOZsrJTDmZKScz5WSmnMyUk5lyMlNeeROQ36TmNwFpahqQpqYB+U1q3nEyU05myslMeeXD1HwSkCeAPKHmRk0D0tQ8oeaTgHzSyUw5mSknM+WVLwPyhJongDQ1vwlIU/MEkCfUfNPJTDmZKScz5ZW/HJAbNQ3I/7OTmXIyU05myit/OTU3QJqa/2cnM+VkppzMlFe+TM1vAnKjpqm5AXKj5h1q/k1OZsrJTDmZKa98GJA/SU0DcgOkqblR04A0NTdA/s1OZsrJTDmZKfgj/2FAbtQ0IE3NDZAbNX+Tk5lyMlNOZgr+yBuANDUNyCepuQHS1DwBpKlpQG7UNCCfpOabTmbKyUw5mSmvfBiQT1JzA+QGSFPTgDQ1DUhTcwOkqXkCyJ90MlNOZsrJTMEf+SIgN2pugNyoeQJIU3MD5Ak1DciNmhsgT6h5x8lMOZkpJzPllTcBaWreAaSpuQFyo+Ydam6AvANIU9PUNCDfdDJTTmbKyUzBH/mDgHySmieAfJKaBqSpaUDeoeaTTmbKyUw5mSmvvAnIE2qeUHMD5AZIU9PU3ABpam6ANDUNSFPTgNyo+aaTmXIyU05mCv7IG4A0Ne8AcqPmHUBu1NwAaWpugNyoaUDeoeYdJzPlZKaczJRXfhmQJ9Q8AaSpuVHzDiBNzY2aGzU3QJqaTzqZKScz5WSmvPIvo6YBeQeQGyBPqGlAGpAbIDdqGpCmpgFpat5xMlNOZsrJTMEf+Q8D8oSaBqSpaUCeUPMEkBs1v+lkppzMlJOZ8sqbgPwmNU3NDZAngDQ1N0BugDQ1N2oakCfUvONkppzMlJOZ8sqHqfkkIDdAmpqmpgG5UdOANDVPqHmHmgbkm05myslMOZkpr3wZkCfUvANIU9PUNCANyA2QGyCfBKSp+aaTmXIyU05myit/GTUNyI2aGyBNzRNAmpoGpAFpahqQGzXvOJkpJzPlZKa88pcB0tTcAGlqmpoGpKlpQJqaBqSpeUJNA/JJJzPlZKaczJRXvkzNN6lpQJ5QcwOkqWlAmpoG5AZIU/MnncyUk5lyMlNe+TAgvwnIDZCmpgF5AkhT84SaGyB/0slMOZkpJzMFf2TmHycz5WSmnMyUk5lyMlNOZsrJTDmZKScz5WSmnMyUk5lyMlNOZsrJTPkf04WVFslwecUAAAAASUVORK5CYII=	2026-01-19 00:00:00	23:00	\N	\N	\N	\N	\N	f	\N	CANCELLED	\N	2026-01-18 13:53:39.918	\N	\N	\N	\N	CUSTOMER	Change of plans	\N	\N	\N	f	f	\N	\N	\N	\N	\N	1	2026-01-18 13:52:52.414	2026-01-18 13:53:39.919	\N	\N
cmkv4bwih0001l8043s4at114	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	cmkv401cb0003js04u3o0455a	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOiSURBVO3BO47sWgIDweSB9r/lnDaeQUuAoKr7G0bEH8z85zBTDjPlMFMOM+UwUw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlMFMuXkrCr6TyRBKeUGlJaCpPJOFXUnnjMFMOM+UwUy4+TOWTkvBEEp5QaUloKi0JTeUJlU9KwicdZsphphxmysWXJeEJlSeScEflThKaSkvCnSQ0lSeS8ITKNx1mymGmHGbKxT9G5Y0k/D87zJTDTDnMlIt/TBKaSktCU7mThKbyLzvMlMNMOcyUiy9T+Zskoam0JDSVN1T+JIeZcpgph5ly8WFJ+J1UWhKaSktCU2lJaCotCU3lThL+ZIeZcpgph5kSf/AXS8ITKk8k4Y7Kv+QwUw4z5TBTLl5KQlNpSfgklaZyJwl3knBHpSWhJaGptCR8kso3HWbKYaYcZsrFl6ncScIdlZaEptKS8IZKS0JTuZOEpvJEEn6nw0w5zJTDTIk/eCEJd1RaEppKS8IdlU9KQlNpSbijcicJTeWJJDyh8sZhphxmymGmXHyYyh2VloSmcicJTaUloam0JDSVOyotCZ+UhKbSVFoSvukwUw4z5TBTLl5SaUloKm8koancUXkiCU+otCQ0lU9Kwh2VTzrMlMNMOcyU+IMXkvCGSktCU2lJeEPlm5LQVFoSmsqf5DBTDjPlMFMuPkzliSTcScIdlZaEptKScEflThKaSlNpSXgiCW+ovHGYKYeZcpgpF1+WhDsqLQlN5U4SmsoTKneScCcJTeWOSkvCHZWWhKbySYeZcpgph5kSf/BCEprKG0n4JJWWhDdUWhI+SaUloam0JDSVNw4z5TBTDjMl/uAvloQ7KneS0FRaEp5QeSIJTeV3OsyUw0w5zJSLl5LwK6k0lTtJaCpvqLQk3ElCU7mThKbSknBH5Y3DTDnMlMNMufgwlU9Kwp0kPJGEJ1TeUHlC5Y7KNx1mymGmHGbKxZcl4QmVN1RaEprKG0m4k4Q3kvCGyhuHmXKYKYeZcvGPSUJTaUloKneS0FSeSEJTaUm4o9KS8E2HmXKYKYeZcvGPS0JTaUloKk2lJaGptCQ0lZaEptKS0JLQVFoSPukwUw4z5TBTLr5M5ZtUWhKeUHlCpSWhqbQk3ElCU/mdDjPlMFMOM+Xiw5LwKyXhiSTcUbmThKbyhsqdJPxKh5lymCmHmRJ/MPOfw0w5zJTDTDnMlMNMOcyUw0w5zJTDTDnMlMNMOcyUw0w5zJTDTPkf4YSmEUgUnlAAAAAASUVORK5CYII=	2026-01-28 00:00:00	14:05	\N	\N	\N	\N	\N	f	\N	SCHEDULED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	Evening dresses and shoes.	\N	1	2026-01-26 12:03:02.106	2026-01-26 12:03:02.863	\N	\N
cmmdhe0980001i904sgq11adt	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	cmkv3w7330001js04pvxymq7m	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAANxSURBVO3BQY4bSQADwWRB//9yrg974KmAhqTB2GBE/IOZ/x1mymGmHGbKYaYcZsphphxmymGmHGbKYaYcZsphphxmymGmHGbKizcl4SepPJGEpnKThHeotCT8JJV3HGbKYaYcZsqLD1P5pCQ8kYQnktBUvknlk5LwSYeZcpgph5ny4suS8ITKE0loKjdJuEnCO1SeSMITKt90mCmHmXKYKS/+cUm4UblJQlNpSfiXHGbKYaYcZsqLf0wSmspNEp5IQlP5lxxmymGmHGbKiy9T+UkqN0m4UWlJuElCU3lC5Tc5zJTDTDnMlBcfloTfJAlNpSXhCZWWhCeS8JsdZsphphxmSvyDv1gSblQ+KQk3Kn+zw0w5zJTDTHnxpiQ0lZaET1JpKi0JN0loKjdJaCpPJOGTVL7pMFMOM+UwU178Mio3SWgqTaUloancJKGptCQ0lSdUnkjCTzrMlMNMOcyUF29SuVFpSWgqN0loKi0JTeUdKi0J35SEptJUWhJuVN5xmCmHmXKYKS/elIQnVFoSmkpTaUloKu9IQlNpKi0JLQlN5QmV3+QwUw4z5TBTXrxJpSWhqTyRhCeS8EQSnkhCU/mkJLxD5ZMOM+UwUw4z5cWbktBUPkmlJeFG5R1JaCotCTcqN0loKr/JYaYcZsphprz4siTcqNwk4ZOScKPSknCj0pJwo3KThKbSknCj8o7DTDnMlMNMefFlKk8koancJOEmCTcqNyo3SXgiCTcqT6h80mGmHGbKYaa8+LIkNJWWhJsk3KjcqLQktCQ0lZaEpvJNSbhRaUloKu84zJTDTDnMlPgHf7EkNJUnkvBJKk8k4QmVbzrMlMNMOcyUF29Kwk9SaSotCTcqNyo3SXgiCU3lCZWWhBuVdxxmymGmHGbKiw9T+aQk3CThJ6m0JNyoPKFyo/JNh5lymCmHmfLiy5LwhMpvkoQnkvCOJLxD5R2HmXKYKYeZ8uIfo9KS8EQS3qHSknCj8o4kfNJhphxmymGmvPjHJKGp3Kg8kYR3qPxmh5lymCmHmfLiy1S+SaUl4ZOS0FS+KQlN5ScdZsphphxmyosPS8JPSkJTuUlCU7lRaUloKi0JTeUJlZskfNNhphxmymGmxD+Y+d9hphxmymGmHGbKYaYcZsphphxmymGmHGbKYaYcZsphphxmymGm/AdUrG0pUruuzQAAAABJRU5ErkJggg==	2026-03-06 00:00:00	02:11	\N	\N	\N	\N	\N	f	\N	SCHEDULED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	Evening dresses	\N	1	2026-03-05 13:08:08.78	2026-03-05 13:08:09.559	\N	\N
cmmm4pyw90001jg04nzzh1s1a	cmkgq2zeg0000ld04dejam16l	cmkgtzpno0002jo04ueqlfrss	\N	\N	2026-03-12 13:00:00	13:00	\N	\N	size 42	\N	\N	f	\N	SCHEDULED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	1	2026-03-11 14:23:27.465	2026-03-11 14:23:27.465	{visits/inspiration/cmkgq2zeg0000ld04dejam16l_1773238997353}	{https://res.cloudinary.com/dmsfvs0c5/image/upload/v1773238997/visits/inspiration/cmkgq2zeg0000ld04dejam16l_1773238997353.jpg}
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: CollectionImage CollectionImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CollectionImage"
    ADD CONSTRAINT "CollectionImage_pkey" PRIMARY KEY (id);


--
-- Name: Discount Discount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Discount"
    ADD CONSTRAINT "Discount_pkey" PRIMARY KEY (id);


--
-- Name: Favorite Favorite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: StoreAnalytics StoreAnalytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreAnalytics"
    ADD CONSTRAINT "StoreAnalytics_pkey" PRIMARY KEY (id);


--
-- Name: StoreCategoryImage StoreCategoryImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreCategoryImage"
    ADD CONSTRAINT "StoreCategoryImage_pkey" PRIMARY KEY (id);


--
-- Name: StoreCategory StoreCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreCategory"
    ADD CONSTRAINT "StoreCategory_pkey" PRIMARY KEY (id);


--
-- Name: StoreCollection StoreCollection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreCollection"
    ADD CONSTRAINT "StoreCollection_pkey" PRIMARY KEY (id);


--
-- Name: StoreImageCategory StoreImageCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreImageCategory"
    ADD CONSTRAINT "StoreImageCategory_pkey" PRIMARY KEY (id);


--
-- Name: StoreImage StoreImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreImage"
    ADD CONSTRAINT "StoreImage_pkey" PRIMARY KEY (id);


--
-- Name: StoreItemDiscount StoreItemDiscount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreItemDiscount"
    ADD CONSTRAINT "StoreItemDiscount_pkey" PRIMARY KEY (id);


--
-- Name: StoreItemImage StoreItemImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreItemImage"
    ADD CONSTRAINT "StoreItemImage_pkey" PRIMARY KEY (id);


--
-- Name: StoreItem StoreItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreItem"
    ADD CONSTRAINT "StoreItem_pkey" PRIMARY KEY (id);


--
-- Name: StoreNotificationPreference StoreNotificationPreference_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreNotificationPreference"
    ADD CONSTRAINT "StoreNotificationPreference_pkey" PRIMARY KEY (id);


--
-- Name: StoreNotification StoreNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreNotification"
    ADD CONSTRAINT "StoreNotification_pkey" PRIMARY KEY (id);


--
-- Name: StoreWeeklyDiscount StoreWeeklyDiscount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreWeeklyDiscount"
    ADD CONSTRAINT "StoreWeeklyDiscount_pkey" PRIMARY KEY (id);


--
-- Name: Store Store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_pkey" PRIMARY KEY (id);


--
-- Name: UserNotificationPreference UserNotificationPreference_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserNotificationPreference"
    ADD CONSTRAINT "UserNotificationPreference_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Visit Visit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Visit"
    ADD CONSTRAINT "Visit_pkey" PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Account_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Account_userId_idx" ON public."Account" USING btree ("userId");


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_entity_entityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_entity_entityId_idx" ON public."AuditLog" USING btree (entity, "entityId");


--
-- Name: AuditLog_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_storeId_idx" ON public."AuditLog" USING btree ("storeId");


--
-- Name: AuditLog_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_userId_idx" ON public."AuditLog" USING btree ("userId");


--
-- Name: Discount_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Discount_code_idx" ON public."Discount" USING btree (code);


--
-- Name: Discount_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Discount_code_key" ON public."Discount" USING btree (code);


--
-- Name: Discount_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Discount_storeId_idx" ON public."Discount" USING btree ("storeId");


--
-- Name: Discount_storeId_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Discount_storeId_isActive_idx" ON public."Discount" USING btree ("storeId", "isActive");


--
-- Name: Discount_validFrom_validTo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Discount_validFrom_validTo_idx" ON public."Discount" USING btree ("validFrom", "validTo");


--
-- Name: Favorite_itemId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Favorite_itemId_idx" ON public."Favorite" USING btree ("itemId");


--
-- Name: Favorite_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Favorite_storeId_idx" ON public."Favorite" USING btree ("storeId");


--
-- Name: Favorite_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Favorite_userId_idx" ON public."Favorite" USING btree ("userId");


--
-- Name: Favorite_userId_storeId_itemId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Favorite_userId_storeId_itemId_key" ON public."Favorite" USING btree ("userId", "storeId", "itemId");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_storeId_idx" ON public."Notification" USING btree ("storeId");


--
-- Name: Notification_userId_read_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_userId_read_idx" ON public."Notification" USING btree ("userId", read);


--
-- Name: OrderItem_itemId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_itemId_idx" ON public."OrderItem" USING btree ("itemId");


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: Order_orderNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_orderNumber_idx" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);


--
-- Name: Order_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_storeId_idx" ON public."Order" USING btree ("storeId");


--
-- Name: Order_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_userId_idx" ON public."Order" USING btree ("userId");


--
-- Name: Review_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Review_storeId_idx" ON public."Review" USING btree ("storeId");


--
-- Name: Review_storeId_rating_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Review_storeId_rating_idx" ON public."Review" USING btree ("storeId", rating);


--
-- Name: Review_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Review_userId_idx" ON public."Review" USING btree ("userId");


--
-- Name: Review_userId_storeId_visitId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Review_userId_storeId_visitId_key" ON public."Review" USING btree ("userId", "storeId", "visitId");


--
-- Name: Review_visitId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Review_visitId_key" ON public."Review" USING btree ("visitId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: StoreAnalytics_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreAnalytics_date_idx" ON public."StoreAnalytics" USING btree (date);


--
-- Name: StoreAnalytics_storeId_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StoreAnalytics_storeId_date_key" ON public."StoreAnalytics" USING btree ("storeId", date);


--
-- Name: StoreAnalytics_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreAnalytics_storeId_idx" ON public."StoreAnalytics" USING btree ("storeId");


--
-- Name: StoreImageCategory_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreImageCategory_storeId_idx" ON public."StoreImageCategory" USING btree ("storeId");


--
-- Name: StoreImageCategory_storeId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StoreImageCategory_storeId_name_key" ON public."StoreImageCategory" USING btree ("storeId", name);


--
-- Name: StoreImage_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreImage_storeId_idx" ON public."StoreImage" USING btree ("storeId");


--
-- Name: StoreImage_storeId_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreImage_storeId_order_idx" ON public."StoreImage" USING btree ("storeId", "order");


--
-- Name: StoreImage_storeId_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreImage_storeId_type_idx" ON public."StoreImage" USING btree ("storeId", type);


--
-- Name: StoreItemDiscount_storeItemId_discountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StoreItemDiscount_storeItemId_discountId_key" ON public."StoreItemDiscount" USING btree ("storeItemId", "discountId");


--
-- Name: StoreItemImage_storeItemId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreItemImage_storeItemId_idx" ON public."StoreItemImage" USING btree ("storeItemId");


--
-- Name: StoreItemImage_storeItemId_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreItemImage_storeItemId_order_idx" ON public."StoreItemImage" USING btree ("storeItemId", "order");


--
-- Name: StoreItem_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StoreItem_sku_key" ON public."StoreItem" USING btree (sku);


--
-- Name: StoreItem_storeId_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreItem_storeId_category_idx" ON public."StoreItem" USING btree ("storeId", category);


--
-- Name: StoreItem_storeId_featured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreItem_storeId_featured_idx" ON public."StoreItem" USING btree ("storeId", featured);


--
-- Name: StoreItem_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreItem_storeId_idx" ON public."StoreItem" USING btree ("storeId");


--
-- Name: StoreItem_storeId_isOnSale_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreItem_storeId_isOnSale_idx" ON public."StoreItem" USING btree ("storeId", "isOnSale");


--
-- Name: StoreNotificationPreference_storeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StoreNotificationPreference_storeId_key" ON public."StoreNotificationPreference" USING btree ("storeId");


--
-- Name: StoreNotification_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreNotification_storeId_idx" ON public."StoreNotification" USING btree ("storeId");


--
-- Name: StoreNotification_storeId_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreNotification_storeId_isRead_idx" ON public."StoreNotification" USING btree ("storeId", "isRead");


--
-- Name: StoreWeeklyDiscount_storeId_dayOfWeek_startTime_endTime_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StoreWeeklyDiscount_storeId_dayOfWeek_startTime_endTime_key" ON public."StoreWeeklyDiscount" USING btree ("storeId", "dayOfWeek", "startTime", "endTime");


--
-- Name: StoreWeeklyDiscount_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreWeeklyDiscount_storeId_idx" ON public."StoreWeeklyDiscount" USING btree ("storeId");


--
-- Name: StoreWeeklyDiscount_storeId_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreWeeklyDiscount_storeId_isActive_idx" ON public."StoreWeeklyDiscount" USING btree ("storeId", "isActive");


--
-- Name: Store_city_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Store_city_idx" ON public."Store" USING btree (city);


--
-- Name: Store_country_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Store_country_idx" ON public."Store" USING btree (country);


--
-- Name: Store_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Store_email_key" ON public."Store" USING btree (email);


--
-- Name: Store_managerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Store_managerId_idx" ON public."Store" USING btree ("managerId");


--
-- Name: Store_managerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Store_managerId_key" ON public."Store" USING btree ("managerId");


--
-- Name: UserNotificationPreference_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserNotificationPreference_userId_key" ON public."UserNotificationPreference" USING btree ("userId");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_resetPasswordToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON public."User" USING btree ("resetPasswordToken");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: User_verificationToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_verificationToken_key" ON public."User" USING btree ("verificationToken");


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Visit_scheduledDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Visit_scheduledDate_idx" ON public."Visit" USING btree ("scheduledDate");


--
-- Name: Visit_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Visit_status_idx" ON public."Visit" USING btree (status);


--
-- Name: Visit_status_scheduledDate_scheduledTime_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Visit_status_scheduledDate_scheduledTime_idx" ON public."Visit" USING btree (status, "scheduledDate", "scheduledTime");


--
-- Name: Visit_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Visit_storeId_idx" ON public."Visit" USING btree ("storeId");


--
-- Name: Visit_storeId_scheduledDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Visit_storeId_scheduledDate_idx" ON public."Visit" USING btree ("storeId", "scheduledDate");


--
-- Name: Visit_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Visit_userId_idx" ON public."Visit" USING btree ("userId");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuditLog AuditLog_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CollectionImage CollectionImage_collectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CollectionImage"
    ADD CONSTRAINT "CollectionImage_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES public."StoreCollection"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Discount Discount_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Discount"
    ADD CONSTRAINT "Discount_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Favorite Favorite_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."StoreItem"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Favorite Favorite_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Favorite Favorite_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."StoreItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_visitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES public."Visit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StoreAnalytics StoreAnalytics_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreAnalytics"
    ADD CONSTRAINT "StoreAnalytics_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StoreCategoryImage StoreCategoryImage_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreCategoryImage"
    ADD CONSTRAINT "StoreCategoryImage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."StoreCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StoreCategory StoreCategory_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreCategory"
    ADD CONSTRAINT "StoreCategory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StoreCollection StoreCollection_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreCollection"
    ADD CONSTRAINT "StoreCollection_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StoreImageCategory StoreImageCategory_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreImageCategory"
    ADD CONSTRAINT "StoreImageCategory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StoreImage StoreImage_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreImage"
    ADD CONSTRAINT "StoreImage_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StoreImage StoreImage_storeImageCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreImage"
    ADD CONSTRAINT "StoreImage_storeImageCategoryId_fkey" FOREIGN KEY ("storeImageCategoryId") REFERENCES public."StoreImageCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StoreItemDiscount StoreItemDiscount_discountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreItemDiscount"
    ADD CONSTRAINT "StoreItemDiscount_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES public."Discount"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StoreItemDiscount StoreItemDiscount_storeItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreItemDiscount"
    ADD CONSTRAINT "StoreItemDiscount_storeItemId_fkey" FOREIGN KEY ("storeItemId") REFERENCES public."StoreItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StoreItemImage StoreItemImage_storeItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreItemImage"
    ADD CONSTRAINT "StoreItemImage_storeItemId_fkey" FOREIGN KEY ("storeItemId") REFERENCES public."StoreItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StoreItem StoreItem_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreItem"
    ADD CONSTRAINT "StoreItem_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StoreNotificationPreference StoreNotificationPreference_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreNotificationPreference"
    ADD CONSTRAINT "StoreNotificationPreference_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StoreNotification StoreNotification_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreNotification"
    ADD CONSTRAINT "StoreNotification_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StoreWeeklyDiscount StoreWeeklyDiscount_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreWeeklyDiscount"
    ADD CONSTRAINT "StoreWeeklyDiscount_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Store Store_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserNotificationPreference UserNotificationPreference_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserNotificationPreference"
    ADD CONSTRAINT "UserNotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Visit Visit_discountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Visit"
    ADD CONSTRAINT "Visit_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES public."Discount"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Visit Visit_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Visit"
    ADD CONSTRAINT "Visit_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Visit Visit_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Visit"
    ADD CONSTRAINT "Visit_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict UcbYAWiEBsIwmNhGJp7Zg3Z6q5PTwN67yeQTbiL6FtJtJmLYVZpcoAMRSTTg1Of

