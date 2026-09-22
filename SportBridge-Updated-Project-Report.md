# PROJECT REPORT

## SportBridge

### A Global, Multi-Sport, Multi-Role Web Platform Connecting Players, Academies, Agents, Scouts and Coaches Across Football and Basketball

**Semester 5 Project | Computer Software Engineering**

**Institution:** Lincoln College of Science Management and Technology  
**Student:** Olufemi Emmanuel Olugbodi  
**Department:** Computer Software Engineering  
**Student ID:** LCSMT-NGA-005-ADM-1001393  
**Supervisor:** Mr Umar Shehu Abdulwahab  
**Updated:** 25 August 2026

---

## 01 Introduction

### 1.1 Background

Talented athletes are often undiscovered because they lack a reliable channel to academies, agents, scouts and coaches. This problem affects grassroots and semi-professional sport across different countries and is especially significant in markets where formal scouting infrastructure is limited.

SportBridge addresses this gap through a shared web platform for football and basketball. It provides role-specific profiles, talent discovery, recruitment tools, messaging, community publishing, job opportunities and trust and safety controls. The platform treats basketball as a first-class sport with separate data storage, registration flows, positions, coaching roles and governing-body fields rather than simply adding a sport label to a football system.

The platform is now deployed and operational on Railway. This updated report records the implemented platform, its verified capabilities and the remaining roadmap features.

### 1.2 Project Overview

SportBridge supports five account categories:

- Players
- Academies and clubs
- Agents and scouts
- Coaches and managers
- Super Administrators

Football and basketball each have sport-specific registration pathways for players, academies, agents and coaches. Users can create profiles, discover relevant users, communicate through the platform, publish feed content, browse or post coaching jobs, and participate in structured trial and try-out workflows.

The platform currently supports English, French, Portuguese, Spanish and Arabic, including right-to-left Arabic layout support. It also includes agent verification fields, ratings, recommendations, reporting, moderation, account suspension controls and a repeated warning advising players and families never to pay an agent or scout to arrange a trial.

---

## 02 Problem Statement

SportBridge was designed around the following problems:

1. Fragmented talent discovery across football and basketball.
2. Administrative dependence on spreadsheets, phone calls and informal messaging groups.
3. Limited player visibility and self-promotion tools.
4. Difficulty assessing agent identity, experience and reputation.
5. Inefficient coaching job advertising and recruitment.
6. Communication silos with no central record.
7. Language barriers for international users.
8. Safeguarding and trust risks, particularly for younger players.

The current implementation addresses these problems through searchable profiles, role-specific workflows, built-in messaging, job applications, trials, try-outs, reporting, moderation and multilingual support.

---

## 03 Proposed Solution

### 3.1 Implemented Core Platform

#### 3.1.1 Dual-Sport Architecture

Football and basketball operational records are stored in physically separate MySQL databases behind one Laravel application. Shared records such as authentication, messaging and feed activity remain available through the common platform. Cross-database actions are resolved deliberately and guarded by sport-specific authorization rules.

#### 3.1.2 Sport-Specific Registration

Players, academies, agents and coaches have separate football and basketball registration paths. Academy forms support sport-relevant governing-body information, including FIFA-related fields for football and FIBA-related fields for basketball. Registration is free and accounts are active immediately, while administrators retain moderation and suspension controls.

#### 3.1.3 Sport-Accurate Profiles

Football and basketball use their own positions, coaching roles, badges and profile fields. Coach profiles also support custom text values for `Other` coaching badges and `Other` preferred roles. These values are validated and persisted for both registration and profile updates.

#### 3.1.4 Agent Trust and Ratings

Agent profiles include licensing and verification information, experience, ratings and computed trust indicators. Active users can rate agents from one to five stars and submit comments. Users can also make non-binding player recommendations to agents without SportBridge processing payments between users.

#### 3.1.5 Safety Disclaimer

The platform repeatedly warns users not to send money, fees or other payments to agents or scouts to arrange trials, try-outs or introductions.

#### 3.1.6 Public Profiles

Players, academies, agents and coaches have public profile pages. Public visibility is restricted when accounts are suspended or removed. Profiles support CVs, media, achievements, professional information and optional LinkedIn details where applicable.

#### 3.1.7 Messaging

Users can communicate through a built-in inbox without initially exchanging personal phone numbers or email addresses. Conversation access is restricted to participants and authorized users.

#### 3.1.8 Community Feed

Users can publish text, images, video, live-video links and online training sessions. Posts support likes, comments and multiple media items. Training posts contain scheduled session details and a join link.

#### 3.1.9 Coaching Job Board

Academies can publish coaching vacancies. Coaches can browse and apply for suitable openings. Applications are restricted by sport and tracked against the relevant job post.

#### 3.1.10 Search and Discovery

Search supports sport-aware player discovery using filters such as position, age, nationality, physical attributes and club-related information. Saved searches and watchlists support repeated discovery workflows.

#### 3.1.11 Trials and Try-Outs

The platform includes structured trial proposals, responses, cancellation and notifications. It also supports try-out opportunity postings, player interest submissions, duplicate-interest prevention, closing controls and poster-only access to interested-player records.

#### 3.1.12 Administration

Super Administrators can review reports, moderate accounts and posts, approve or deny actions where applicable, suspend, restore or remove accounts, and view analytics and data records. Safeguards prevent administrators from removing themselves or leaving the platform without a remaining administrator.

#### 3.1.13 Security

The application uses Laravel authentication, CSRF protection, password hashing, rate limiting, security headers, Content Security Policy support, HTTP-only session cookies and role-based authorization. Cross-sport actions are explicitly checked to prevent football users from acting on basketball records and vice versa.

#### 3.1.14 Internationalisation and Responsive Design

The interface supports English, French, Portuguese, Spanish and Arabic. Arabic pages use right-to-left layout handling. The frontend uses responsive Bootstrap layouts, light and dark themes, sport imagery and responsive role dashboards.

### 3.2 Remaining Development Roadmap

The following proposal features are not yet fully implemented and remain planned:

- AI-assisted matching using a dedicated Python/FastAPI service.
- A React Native mobile application for Android and iOS.
- Firebase Cloud Messaging integration for the future mobile app.
- Full managed YouTube Live playback and session archiving inside the platform.
- Structured coach-entered player performance ratings and progress charts.
- Profile-completion badges and activity streaks for every role.
- Paystack or Flutterwave subscription billing for agents and academies.
- Mandarin, Hindi, Bengali, Russian and Urdu translations.

---

## 04 Novelty and Originality

SportBridge is a neutral multi-organisation platform rather than a single academy website. Its main technical distinction is the deliberate separation of football and basketball operational databases under one shared application and identity system.

Other original elements include free self-service player registration, sport-specific profile vocabularies, built-in agent trust signals, feed-native training sessions, cross-role messaging, structured try-out workflows, multilingual RTL support and moderation controls designed for a platform involving minors and adult professionals.

---

## 05 Improvements Over Existing Solutions

| Capability | Typical Recruitment Tool | SportBridge |
|---|---|---|
| Sports | Usually one sport | Football and basketball with separate operational data |
| Player access | Often paid or club-gated | Free, self-service and active immediately |
| Roles | One or two roles | Players, academies, agents, coaches and administrators |
| Registration | Generic form | Sport-specific registration pathways |
| Agent trust | Often unverified | License fields, verification, ratings and trust indicators |
| Messaging | Phone or external messaging | Built-in participant-controlled inbox |
| Recruitment | Informal contacts | Jobs, applications, trials and try-outs |
| Feed | Static posts or absent | Text, photos, video, live links and training sessions |
| Languages | Often English only | English, French, Portuguese, Spanish and Arabic RTL |
| Moderation | Limited or undisclosed | Reporting, suspension, restoration and administrator safeguards |
| Security | Rarely documented | CSRF, CSP support, rate limits, hashing and authorization controls |

---

## 06 Technology Stack

### 6.1 Current Platform

| Layer | Technology |
|---|---|
| Backend | Laravel 12.64 with PHP 8.2 |
| ORM | Eloquent ORM |
| Database | MySQL 8 with separate football and basketball databases |
| Templates | Laravel Blade |
| Frontend | Bootstrap 5.3 and responsive CSS |
| Asset build | Vite 6 |
| Client scripting | Modular vanilla JavaScript and event delegation |
| Authentication | Laravel authentication and Sanctum API tokens |
| Security | CSP support, security headers, CSRF, password hashing and rate limiting |
| Media | Intervention Image, GD/WebP and public/private storage |
| Notifications | Database, email and Web Push notification support |
| Email | Laravel mail with Brevo HTTP integration support |
| Testing | PHPUnit through Laravel's testing framework |
| Local environment | XAMPP, Apache and MySQL |
| Production | Docker, Apache and Railway |

### 6.2 Planned Technology

| Feature | Planned Technology |
|---|---|
| AI matching | Python, FastAPI and scikit-learn |
| Mobile app | React Native |
| Mobile push | Firebase Cloud Messaging |
| Live streaming | YouTube Live API |
| Subscriptions | Paystack or Flutterwave |
| Additional languages | Laravel JSON translation architecture |

---

## 07 Project Objectives and Current Status

| Objective | Current Status |
|---|---|
| O1 AI-assisted player-club matching | Planned; current search, recommendations and saved searches are rule-based platform features |
| O2 Structured trial workflow | Delivered; trials and try-outs are implemented and tested |
| O3 Native mobile application | Planned; API foundation exists but React Native app is not yet delivered |
| O4 In-platform live playback | Partially delivered; live and training links exist, full managed playback remains planned |
| O5 Performance analytics | Partially delivered; platform analytics exist, structured player performance tracking remains planned |
| O6 Extended trust badges | Partially delivered; agent verification, ratings, achievements and profile completeness exist |
| O7 Paid subscriptions | Planned; no production billing integration yet |
| O8 Five additional languages | Planned; five languages are currently live |

---

## 08 Expected Outcomes

The implemented platform provides a wider discovery channel for players, academies, agents and coaches across two sports. It reduces reliance on informal recruitment channels through searchable profiles, jobs, applications, trials, try-outs and messaging.

Trust and safety are strengthened through ratings, verification information, reporting, moderation, suspension controls, cross-sport guards and clear anti-payment warnings. The current five-language interface and Arabic RTL support improve accessibility, while the remaining roadmap provides a path toward broader global reach and sustainable revenue.

---

## 09 Project Timeline and Execution Plan

| Phase | Work | Status |
|---|---|---|
| 1 | Requirements and system design | Delivered |
| 2 | Dual-sport architecture and role profiles | Delivered |
| 3 | Authentication, security and moderation | Delivered |
| 4 | Messaging, jobs, applications, trials and try-outs | Delivered |
| 5 | Search, recommendations, ratings and analytics | Partially delivered |
| 6 | Feed media, live links, training sessions and notifications | Partially delivered |
| 7 | Docker and Railway deployment | Delivered |
| 8 | AI matching | Planned |
| 9 | React Native mobile application | Planned |
| 10 | Performance dashboards, trust badges and subscriptions | Planned |
| 11 | Additional languages and external integrations | Planned |

### 9.1 Verification Evidence

- Full Laravel test suite: 153 tests passed.
- Assertions recorded: 459.
- Custom coach badge and preferred-role tests: 2 tests passed, 7 assertions.
- PHP syntax validation: 303 files passed.
- Blade template compilation: successful.
- Vite production build: successful.
- Composer validation: successful.
- Railway health endpoint: HTTP 200.
- Railway production service: online.

---

## 10 Conclusion

SportBridge has progressed from a proposal into a deployed dual-sport talent networking platform. Its delivered foundation supports players, academies, agents, coaches and administrators through sport-specific profiles, separate football and basketball data stores, public discovery, jobs, messaging, feed publishing, trials, try-outs, ratings, notifications and moderation.

The platform is operational on Railway and has been functionally verified through automated tests, syntax checks, Blade compilation and production asset builds. The current implementation directly addresses the central problems identified in the proposal while preserving a clear roadmap for AI matching, mobile access, advanced analytics, managed streaming, subscriptions and additional languages.

The next phase should focus on completing the planned features without weakening the existing security, safeguarding, sport separation and testing standards.

---

## 11 References

- Laravel Documentation. Laravel Framework Documentation.
- Bootstrap Documentation. Bootstrap 5.3 Documentation.
- Vite Documentation. Vite Build Tool Documentation.
- MDN Web Docs. Content Security Policy.
- OWASP. OWASP Top 10 Web Application Security Risks.
- W3C Internationalization. Structural Markup and Right-to-Left Support.
- FIFA. FIFA Connect and Transfer Matching System.
- FIBA. FIBA Management and Administration Platform.
- PHPUnit Documentation.
- React Native Documentation.
- Scikit-learn Documentation.
- Paystack API Documentation.
- Flutterwave API Documentation.

---

## 12 Appendices

### Appendix A: Current Architecture

One Laravel application serves the web interface and API. Authentication, messaging, notifications and feed activity are shared. Football and basketball operational records use separate MySQL connections. Docker packages the application for Apache and Railway. Uploaded public and private files use application storage with a persistent Railway volume.

### Appendix B: Main Functional Areas

- Role registration and authentication
- Football and basketball profiles
- Academy teams and player management
- Agent verification, ratings and recommendations
- Search, watchlists and saved searches
- Messaging and notifications
- Community feed and media
- Coaching jobs and applications
- Trials and try-outs
- Reports, moderation and analytics
- API authentication, player and job endpoints

### Appendix C: Security Checklist

- CSRF protection enabled.
- Password complexity and hashing enabled.
- Rate limits applied to sensitive workflows.
- Role and sport authorization checks implemented.
- Account suspension and restoration supported.
- Administrator self-removal safeguards implemented.
- CSP and security headers configured.
- Private documents served through protected routes.
- Minor registration consent fields supported.

### Appendix D: Deployment Configuration

- GitHub repository: `Olufemi-ObaTech/sportbridge`
- Branch: `main`
- Latest validated release: commit `5c5a98f`
- Railway project: `vivacious-caring`
- Railway service: `sportbridge`
- Production URL: https://sportbridge.up.railway.app
- Health route: `/up`
- Build: Dockerfile with Vite asset compilation
- Runtime: Apache with PHP 8.2
- Database: Railway MySQL with separate sport connection support

### Appendix E: Project Limitations

The platform does not currently include a production AI matching microservice, native mobile application, payment subscriptions, five additional languages, complete managed YouTube Live playback, or structured player performance tracking. These are clearly identified as future development work rather than delivered functionality.

---

## 13 Declaration

I, Olufemi Emmanuel Olugbodi, declare that this project and its implementation are my original work and that all sources used have been appropriately acknowledged.

**Student:** Olufemi Emmanuel Olugbodi  
**Supervisor:** Mr Umar Shehu Abdulwahab  
**Date:** 25 August 2026

**Student Signature:** ________________________________

**Supervisor Signature:** ______________________________
