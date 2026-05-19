# Sprint 3 Kanban Board

**Sprint:** Sprint 3  
**Sprint Theme:** System integration, feature completion, testing, bug fixing, documentation and final demo preparation.  
**Main Focus:** Turn the MVP into a more complete and presentable shared scooter system.

---

## Sprint Goal

The goal of Sprint 3 is to complete the main user, dispatcher and administrator workflows, integrate the frontend and backend more reliably, fix defects found in Sprint 2, and prepare final project documentation and demonstration materials.

By the end of this sprint, Panda Scooter should be presentable as a full-stack shared scooter platform with a clear rider workflow, dispatcher workflow, administrator workflow, database persistence, API documentation, wiki documentation and final demo evidence.

---

## Kanban Summary

| Status | Number of Items | Description |
|---|---:|---|
| Backlog | 3 | Optional improvements beyond the final coursework/demo scope. |
| To Do | 3 | Final documentation and polishing tasks. |
| In Progress | 4 | Integration, testing and feature completion tasks. |
| Review / Verification | 6 | Final validation before demo/submission. |
| Done | 11 | Completed implementation and documentation outcomes. |

---

## Backlog

| ID | Item | Owner | Priority | Notes |
|---|---|---|---|---|
| S3-B01 | Real-time vehicle telemetry through physical IoT hardware | Jingkun | Low | Current version can use simulated scooter/device state. |
| S3-B02 | Advanced recommendation for scooter redistribution | Kecen / Chenhao | Low | Useful future work, but beyond the core shared-scooter MVP. |
| S3-B03 | Production-grade payment integration | Liheng / Zhicheng | Medium | Demo can use simulated payment status if external payment integration is not required. |

---

## To Do

| ID | Item | Owner | Priority | Acceptance Criteria |
|---|---|---|---|---|
| S3-T01 | Finalise project README and quick-start guide | Jingkun | High | README clearly explains tech stack, project structure, startup commands and main functions. |
| S3-T02 | Complete Sprint 3 Review page and retrospective notes | Jingkun / All | Medium | Wiki contains final sprint outcome, screenshots, remaining limitations and lessons learned. |
| S3-T03 | Prepare final demo script and presentation flow | Liheng / Jingkun | High | Demo covers rider, dispatcher and admin workflows in a logical order. |

---

## In Progress

| ID | Item | Owner | Priority | Current Progress / Acceptance Criteria |
|---|---|---|---|---|
| S3-P01 | Complete end-to-end ride lifecycle integration | Zhicheng / Chenhao | High | User can complete login, scooter selection, unlock/rent, ride status update and return process. |
| S3-P02 | Complete dispatcher fault-handling and remote operation workflow | Kecen | High | Dispatcher can view faulty scooters, inspect details and perform remote operational actions. |
| S3-P03 | Complete administrator management workflow | Chenhao / Liheng | High | Admin can manage scooter, parking point, zone, dispatcher/staff and pricing/subscription information. |
| S3-P04 | Fix frontend-backend integration bugs | Jingkun / All | High | Major API, routing, token and data-format bugs are resolved before final demo. |

---

## Review / Verification

| ID | Item | Owner | Priority | Verification Method |
|---|---|---|---|---|
| S3-R01 | Verify complete rider workflow | Zhicheng / Jingkun | High | Demonstrate register/login, map view, rent, return, payment/status and ride record behaviour. |
| S3-R02 | Verify complete dispatcher workflow | Kecen | High | Demonstrate faulty scooter query, operational map view and remote unlock/management action. |
| S3-R03 | Verify complete administrator workflow | Liheng / Chenhao | High | Demonstrate dashboard, parking point, zone, scooter and staff management pages. |
| S3-R04 | Verify API documentation and backend consistency | Chenhao / Jingkun | High | Documented API endpoints match actual implemented request/response behaviour. |
| S3-R05 | Verify database persistence and data consistency | Chenhao | High | Data changes from frontend operations are persisted and can be queried correctly. |
| S3-R06 | Verify final UI consistency and usability | Liheng / Zhicheng | Medium | Pages follow wireframes, navigation is clear, and the demo process is smooth. |

---

## Done

| ID | Item | Owner | Priority | Completion Evidence |
|---|---|---|---|---|
| S3-D01 | Complete multi-role system structure | All | High | User app, dispatcher app and admin app are connected to the shared backend. |
| S3-D02 | Complete rider-side map-based scooter discovery | Zhicheng | High | Rider can view scooters and parking-related information on map. |
| S3-D03 | Complete backend service and controller structure | Chenhao / Jingkun | High | Backend exposes APIs for authentication, scooters, rides, parking/zone and management data. |
| S3-D04 | Complete database integration | Chenhao | High | MySQL persistence is used for key business entities. |
| S3-D05 | Complete admin dashboard skeleton and major management pages | Liheng / Chenhao | High | Admin UI supports core management workflow. |
| S3-D06 | Complete dispatcher basic operational interface | Kecen | High | Dispatcher UI supports operational map and fault/vehicle handling entry points. |
| S3-D07 | Add or update API documentation | Jingkun / Chenhao | High | API documentation can support review and future maintenance. |
| S3-D08 | Add or update GitHub Wiki project documentation | Jingkun | Medium | Wiki contains sprint planning/review, wireframes, API documentation and meeting/project notes. |
| S3-D09 | Improve README project introduction | Jingkun | Medium | README describes project structure, technology stack, features, architecture and quick start. |
| S3-D10 | Prepare final testing checklist | All | Medium | Main functional paths are tested before demo. |
| S3-D11 | Prepare final project demo materials | Liheng / Jingkun | High | Demo route and screenshots/video materials are ready for assessment. |

---

## Final Bug / Risk List

| Risk / Bug | Impact | Mitigation |
|---|---|---|
| Map service key or network issue | Demo map may fail to load. | Prepare screenshots/video and local fallback data. |
| Frontend-backend API field mismatch | Pages may not render expected data. | Freeze request/response format before final demo and update API documentation. |
| Database seed data missing | Demo may lack scooters, zones or users. | Prepare initial SQL or manual seed data before presentation. |
| Role-based access not fully enforced | Users may access incorrect pages/API. | Add simple frontend route guards and backend token/role checks where possible. |

---

## Sprint 3 Review Notes

Sprint 3 should focus on final integration and evidence. The review should show the project as a coherent product rather than isolated pages. The recommended demo order is: rider login and scooter rental, dispatcher operational handling, administrator management, then backend/API/database explanation. Remaining limitations should be described as future work instead of hidden, especially physical scooter integration, real payment service and production-grade deployment.
