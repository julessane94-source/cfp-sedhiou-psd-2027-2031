--
-- PostgreSQL database dump
--

\restrict UgQnCcF7Zm2zsIsJSq1VPj6yBERak2Kboh9cpwm0LtUEmtq1MVveKVwleQKMXdv

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ActionStatus; Type: TYPE; Schema: public; Owner: cfp_admin
--

CREATE TYPE public."ActionStatus" AS ENUM (
    'PLANIFIEE',
    'EN_COURS',
    'TERMINEE',
    'EN_RETARD'
);


ALTER TYPE public."ActionStatus" OWNER TO cfp_admin;

--
-- Name: AssetStatus; Type: TYPE; Schema: public; Owner: cfp_admin
--

CREATE TYPE public."AssetStatus" AS ENUM (
    'ACTIF',
    'EN_MAINTENANCE',
    'HORS_SERVICE',
    'REFORME'
);


ALTER TYPE public."AssetStatus" OWNER TO cfp_admin;

--
-- Name: DocumentStatus; Type: TYPE; Schema: public; Owner: cfp_admin
--

CREATE TYPE public."DocumentStatus" AS ENUM (
    'BROUILLON',
    'VALIDE',
    'ARCHIVE'
);


ALTER TYPE public."DocumentStatus" OWNER TO cfp_admin;

--
-- Name: OperationType; Type: TYPE; Schema: public; Owner: cfp_admin
--

CREATE TYPE public."OperationType" AS ENUM (
    'RECETTE',
    'DEPENSE',
    'ENGAGEMENT',
    'PAIEMENT'
);


ALTER TYPE public."OperationType" OWNER TO cfp_admin;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: cfp_admin
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."UserStatus" OWNER TO cfp_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Agent; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."Agent" (
    id text NOT NULL,
    matricule text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "position" text,
    "contractType" text,
    phone text,
    email text,
    "hireDate" timestamp(3) without time zone,
    "serviceId" text,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Agent" OWNER TO cfp_admin;

--
-- Name: Asset; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."Asset" (
    id text NOT NULL,
    "inventoryCode" text NOT NULL,
    name text NOT NULL,
    description text,
    "acquisitionDate" timestamp(3) without time zone,
    "acquisitionValue" numeric(15,2),
    location text,
    status public."AssetStatus" DEFAULT 'ACTIF'::public."AssetStatus" NOT NULL,
    "categoryId" text,
    "serviceId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Asset" OWNER TO cfp_admin;

--
-- Name: AssetCategory; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."AssetCategory" (
    id text NOT NULL,
    name text NOT NULL,
    description text
);


ALTER TABLE public."AssetCategory" OWNER TO cfp_admin;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    metadata jsonb,
    "ipAddress" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO cfp_admin;

--
-- Name: Budget; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."Budget" (
    id text NOT NULL,
    year integer NOT NULL,
    title text NOT NULL,
    amount numeric(15,2) NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Budget" OWNER TO cfp_admin;

--
-- Name: BudgetLine; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."BudgetLine" (
    id text NOT NULL,
    "budgetId" text NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    allocated numeric(15,2) NOT NULL,
    committed numeric(15,2) DEFAULT 0 NOT NULL,
    spent numeric(15,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BudgetLine" OWNER TO cfp_admin;

--
-- Name: Document; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."Document" (
    id text NOT NULL,
    title text NOT NULL,
    "fileName" text NOT NULL,
    "storageKey" text NOT NULL,
    "mimeType" text,
    size integer,
    status public."DocumentStatus" DEFAULT 'BROUILLON'::public."DocumentStatus" NOT NULL,
    "authorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Document" OWNER TO cfp_admin;

--
-- Name: Enrollment; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."Enrollment" (
    id text NOT NULL,
    "learnerId" text NOT NULL,
    "trainingId" text NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    status text,
    "academicYear" text DEFAULT 'NON_RENSEIGNEE'::text NOT NULL,
    level text
);


ALTER TABLE public."Enrollment" OWNER TO cfp_admin;

--
-- Name: FinancialOperation; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."FinancialOperation" (
    id text NOT NULL,
    reference text NOT NULL,
    type public."OperationType" NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    description text NOT NULL,
    amount numeric(15,2) NOT NULL,
    "budgetLineId" text,
    "supplierId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FinancialOperation" OWNER TO cfp_admin;

--
-- Name: Learner; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."Learner" (
    id text NOT NULL,
    matricule text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    email text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "birthDate" timestamp(3) without time zone,
    "integrationYear" integer
);


ALTER TABLE public."Learner" OWNER TO cfp_admin;

--
-- Name: Maintenance; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."Maintenance" (
    id text NOT NULL,
    "assetId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    description text NOT NULL,
    cost numeric(15,2),
    provider text,
    status text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Maintenance" OWNER TO cfp_admin;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO cfp_admin;

--
-- Name: PSDAction; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."PSDAction" (
    id text NOT NULL,
    "objectiveId" text,
    "axisId" text NOT NULL,
    title text NOT NULL,
    indicator text,
    baseline text,
    target2031 text,
    responsible text,
    "startYear" integer NOT NULL,
    "endYear" integer NOT NULL,
    budget numeric(15,2),
    status public."ActionStatus" DEFAULT 'PLANIFIEE'::public."ActionStatus" NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PSDAction" OWNER TO cfp_admin;

--
-- Name: PSDAxis; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."PSDAxis" (
    id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    purpose text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PSDAxis" OWNER TO cfp_admin;

--
-- Name: PSDObjective; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."PSDObjective" (
    id text NOT NULL,
    "axisId" text NOT NULL,
    title text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PSDObjective" OWNER TO cfp_admin;

--
-- Name: Role; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Role" OWNER TO cfp_admin;

--
-- Name: Service; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."Service" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Service" OWNER TO cfp_admin;

--
-- Name: Supplier; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."Supplier" (
    id text NOT NULL,
    name text NOT NULL,
    identifier text,
    phone text,
    email text,
    address text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Supplier" OWNER TO cfp_admin;

--
-- Name: Training; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."Training" (
    id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    category text,
    level text,
    duration text,
    description text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Training" OWNER TO cfp_admin;

--
-- Name: User; Type: TABLE; Schema: public; Owner: cfp_admin
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "roleId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO cfp_admin;

--
-- Data for Name: Agent; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."Agent" (id, matricule, "firstName", "lastName", "position", "contractType", phone, email, "hireDate", "serviceId", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Asset; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."Asset" (id, "inventoryCode", name, description, "acquisitionDate", "acquisitionValue", location, status, "categoryId", "serviceId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AssetCategory; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."AssetCategory" (id, name, description) FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."AuditLog" (id, "userId", action, entity, "entityId", metadata, "ipAddress", "createdAt") FROM stdin;
\.


--
-- Data for Name: Budget; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."Budget" (id, year, title, amount, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BudgetLine; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."BudgetLine" (id, "budgetId", code, label, allocated, committed, spent, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."Document" (id, title, "fileName", "storageKey", "mimeType", size, status, "authorId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Enrollment; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."Enrollment" (id, "learnerId", "trainingId", "startDate", "endDate", status, "academicYear", level) FROM stdin;
cmufxbkui00015h8b7zdajsj9	cmufxaxf900005h8bbvqaqdb7	cmufw4ehv0000k98bvyf2jhuy	2026-09-24 19:27:20.391	\N	INSCRIT	2027	1ère année
\.


--
-- Data for Name: FinancialOperation; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."FinancialOperation" (id, reference, type, date, description, amount, "budgetLineId", "supplierId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Learner; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."Learner" (id, matricule, "firstName", "lastName", phone, email, "createdAt", "updatedAt", "birthDate", "integrationYear") FROM stdin;
cmufxaxf900005h8bbvqaqdb7	p2324092000	Souleymane	SANE	778851692	julessane94@gmail.com	2026-09-24 19:26:50.038	2026-09-24 19:26:50.038	2000-09-24 00:00:00	2023
\.


--
-- Data for Name: Maintenance; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."Maintenance" (id, "assetId", date, description, cost, provider, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."Notification" (id, "userId", title, message, read, "createdAt") FROM stdin;
\.


--
-- Data for Name: PSDAction; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."PSDAction" (id, "objectiveId", "axisId", title, indicator, baseline, target2031, responsible, "startYear", "endYear", budget, status, progress, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PSDAxis; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."PSDAxis" (id, code, title, purpose, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PSDObjective; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."PSDObjective" (id, "axisId", title, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."Role" (id, name, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."Service" (id, name, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."Supplier" (id, name, identifier, phone, email, address, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Training; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."Training" (id, code, title, category, level, duration, description, active, "createdAt", "updatedAt") FROM stdin;
cmufw4ehv0000k98bvyf2jhuy	INFO-01	Bureautique	Informatique	CAP	12 mois	\N	t	2026-09-24 18:53:45.955	2026-09-24 18:53:45.955
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: cfp_admin
--

COPY public."User" (id, email, "passwordHash", "firstName", "lastName", status, "roleId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: Agent Agent_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Agent"
    ADD CONSTRAINT "Agent_pkey" PRIMARY KEY (id);


--
-- Name: AssetCategory AssetCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."AssetCategory"
    ADD CONSTRAINT "AssetCategory_pkey" PRIMARY KEY (id);


--
-- Name: Asset Asset_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BudgetLine BudgetLine_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."BudgetLine"
    ADD CONSTRAINT "BudgetLine_pkey" PRIMARY KEY (id);


--
-- Name: Budget Budget_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Budget"
    ADD CONSTRAINT "Budget_pkey" PRIMARY KEY (id);


--
-- Name: Document Document_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);


--
-- Name: Enrollment Enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY (id);


--
-- Name: FinancialOperation FinancialOperation_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."FinancialOperation"
    ADD CONSTRAINT "FinancialOperation_pkey" PRIMARY KEY (id);


--
-- Name: Learner Learner_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Learner"
    ADD CONSTRAINT "Learner_pkey" PRIMARY KEY (id);


--
-- Name: Maintenance Maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Maintenance"
    ADD CONSTRAINT "Maintenance_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: PSDAction PSDAction_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."PSDAction"
    ADD CONSTRAINT "PSDAction_pkey" PRIMARY KEY (id);


--
-- Name: PSDAxis PSDAxis_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."PSDAxis"
    ADD CONSTRAINT "PSDAxis_pkey" PRIMARY KEY (id);


--
-- Name: PSDObjective PSDObjective_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."PSDObjective"
    ADD CONSTRAINT "PSDObjective_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id);


--
-- Name: Training Training_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Training"
    ADD CONSTRAINT "Training_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Agent_matricule_key; Type: INDEX; Schema: public; Owner: cfp_admin
--

CREATE UNIQUE INDEX "Agent_matricule_key" ON public."Agent" USING btree (matricule);


--
-- Name: Agent_userId_key; Type: INDEX; Schema: public; Owner: cfp_admin
--

CREATE UNIQUE INDEX "Agent_userId_key" ON public."Agent" USING btree ("userId");


--
-- Name: AssetCategory_name_key; Type: INDEX; Schema: public; Owner: cfp_admin
--

CREATE UNIQUE INDEX "AssetCategory_name_key" ON public."AssetCategory" USING btree (name);


--
-- Name: Asset_inventoryCode_key; Type: INDEX; Schema: public; Owner: cfp_admin
--

CREATE UNIQUE INDEX "Asset_inventoryCode_key" ON public."Asset" USING btree ("inventoryCode");


--
-- Name: Enrollment_learnerId_trainingId_academicYear_key; Type: INDEX; Schema: public; Owner: cfp_admin
--

CREATE UNIQUE INDEX "Enrollment_learnerId_trainingId_academicYear_key" ON public."Enrollment" USING btree ("learnerId", "trainingId", "academicYear");


--
-- Name: FinancialOperation_reference_key; Type: INDEX; Schema: public; Owner: cfp_admin
--

CREATE UNIQUE INDEX "FinancialOperation_reference_key" ON public."FinancialOperation" USING btree (reference);


--
-- Name: Learner_matricule_key; Type: INDEX; Schema: public; Owner: cfp_admin
--

CREATE UNIQUE INDEX "Learner_matricule_key" ON public."Learner" USING btree (matricule);


--
-- Name: PSDAxis_code_key; Type: INDEX; Schema: public; Owner: cfp_admin
--

CREATE UNIQUE INDEX "PSDAxis_code_key" ON public."PSDAxis" USING btree (code);


--
-- Name: Role_name_key; Type: INDEX; Schema: public; Owner: cfp_admin
--

CREATE UNIQUE INDEX "Role_name_key" ON public."Role" USING btree (name);


--
-- Name: Service_name_key; Type: INDEX; Schema: public; Owner: cfp_admin
--

CREATE UNIQUE INDEX "Service_name_key" ON public."Service" USING btree (name);


--
-- Name: Training_code_key; Type: INDEX; Schema: public; Owner: cfp_admin
--

CREATE UNIQUE INDEX "Training_code_key" ON public."Training" USING btree (code);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: cfp_admin
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Agent Agent_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Agent"
    ADD CONSTRAINT "Agent_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Agent Agent_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Agent"
    ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Asset Asset_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."AssetCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Asset Asset_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BudgetLine BudgetLine_budgetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."BudgetLine"
    ADD CONSTRAINT "BudgetLine_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES public."Budget"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Document Document_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Enrollment Enrollment_learnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES public."Learner"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Enrollment Enrollment_trainingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES public."Training"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FinancialOperation FinancialOperation_budgetLineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."FinancialOperation"
    ADD CONSTRAINT "FinancialOperation_budgetLineId_fkey" FOREIGN KEY ("budgetLineId") REFERENCES public."BudgetLine"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FinancialOperation FinancialOperation_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."FinancialOperation"
    ADD CONSTRAINT "FinancialOperation_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Maintenance Maintenance_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."Maintenance"
    ADD CONSTRAINT "Maintenance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public."Asset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PSDAction PSDAction_axisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."PSDAction"
    ADD CONSTRAINT "PSDAction_axisId_fkey" FOREIGN KEY ("axisId") REFERENCES public."PSDAxis"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PSDAction PSDAction_objectiveId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."PSDAction"
    ADD CONSTRAINT "PSDAction_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES public."PSDObjective"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PSDObjective PSDObjective_axisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."PSDObjective"
    ADD CONSTRAINT "PSDObjective_axisId_fkey" FOREIGN KEY ("axisId") REFERENCES public."PSDAxis"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfp_admin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict UgQnCcF7Zm2zsIsJSq1VPj6yBERak2Kboh9cpwm0LtUEmtq1MVveKVwleQKMXdv

