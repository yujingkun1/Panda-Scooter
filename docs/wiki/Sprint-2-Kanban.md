# Sprint 2 Kanban Board

**Sprint:** Sprint 2  
**Sprint Theme:** MVP implementation for authentication, map-based scooter usage, backend API, database integration and first runnable frontend modules.  
**Main Focus:** Convert Sprint 1 requirements and design artefacts into working software.

---

## Sprint Goal

The goal of Sprint 2 is to build the first usable MVP of Panda Scooter. Based on the Sprint 1 requirement analysis, Sprint 2 focuses on implementing the core technical foundation: backend service structure, database integration, authentication, rider-side map/rental workflow, dispatcher-side operational view, and initial administrator management pages.

By the end of this sprint, the team should have a runnable system skeleton across backend, rider app, dispatcher app and admin dashboard, with the key end-to-end flow partially or fully demonstrable.

---

## Kanban Summary

| Status | Number of Items | Description |
|---|---:|---|
| Backlog | 4 | Non-MVP or enhancement tasks postponed to Sprint 3. |
| To Do | 2 | Remaining documentation and refinement tasks. |
| In Progress | 4 | Features under implementation or integration. |
| Review / Verification | 5 | Implemented modules requiring testing, code review or UI validation. |
| Done | 10 | Core setup and initial MVP features completed. |

---

## Backlog

| ID | Item | Owner | Priority | Notes |
|---|---|---|---|---|
| S2-B01 | Advanced dashboard analytics and data visualisation | Chenhao | Medium | Can be improved after basic admin CRUD and data collection are stable. |
| S2-B02 | Monthly subscription package purchase workflow | Liheng / Zhicheng | Medium | Requires stable payment/rental foundation first. |
| S2-B03 | Detailed ride history statistics and personal reports | Zhicheng | Medium | Depends on completed ride record persistence. |
| S2-B04 | Full deployment optimisation with Nginx/MQTT production configuration | Jingkun | Medium | Basic deployment notes can be kept, but full deployment can be completed later. |

---

## To Do

| ID | Item | Owner | Priority | Acceptance Criteria |
|---|---|---|---|---|
| S2-T01 | Update API documentation according to implemented backend endpoints | Jingkun / Chenhao | High | API document includes authentication, scooter, parking, ride and admin-related endpoints. |
| S2-T02 | Prepare Sprint 2 review evidence | Jingkun | Medium | Screenshots, commits and demo notes are collected for the wiki review page. |

---

## In Progress

| ID | Item | Owner | Priority | Current Progress / Acceptance Criteria |
|---|---|---|---|---|
| S2-P01 | Implement rider-side rent and return workflow | Zhicheng | High | User can select a scooter, start a ride, view riding state and return the scooter. |
| S2-P02 | Implement dispatcher-side faulty vehicle and operational map workflow | Kecen | High | Dispatcher can view abnormal/faulty scooters and perform operational actions. |
| S2-P03 | Implement admin-side parking point and zone management | Chenhao | High | Admin can create, edit, delete and view parking points/zones on the map. |
| S2-P04 | Integrate frontend apps with backend API | Jingkun / All | High | User, dispatcher and admin apps communicate with the Spring Boot backend instead of mock data only. |

---

## Review / Verification

| ID | Item | Owner | Priority | Verification Method |
|---|---|---|---|---|
| S2-R01 | Verify user login and registration | Liheng / Jingkun | High | Test normal login, registration, invalid password and token/session handling. |
| S2-R02 | Verify map display and scooter marker rendering | Zhicheng | High | Test that scooters and parking points are displayed correctly on the map. |
| S2-R03 | Verify backend database schema and MyBatis persistence | Chenhao | High | Confirm entities, DTO/VO objects and database tables match implemented workflows. |
| S2-R04 | Verify administrator CRUD pages | Chenhao / Liheng | High | Check parking point, zone, scooter and staff management operations. |
| S2-R05 | Verify cross-role navigation and page consistency | Jingkun | Medium | Check that rider, dispatcher and admin apps follow the agreed wireframes. |

---

## Done

| ID | Item | Owner | Priority | Completion Evidence |
|---|---|---|---|---|
| S2-D01 | Create Spring Boot backend module structure | Jingkun / Chenhao | High | Backend organised into common, pojo and server modules. |
| S2-D02 | Configure Java 17, Spring Boot, MyBatis and MySQL environment | Chenhao | High | Backend can connect to database and run locally. |
| S2-D03 | Create initial database tables for users, scooters, rides and parking/zone data | Chenhao | High | Core entities required by MVP are represented in the database. |
| S2-D04 | Implement JWT-based authentication foundation | Jingkun / Chenhao | High | Login-protected APIs can identify current user role. |
| S2-D05 | Create rider UniApp project skeleton | Zhicheng | High | Rider app includes basic pages for login, map and ride flow. |
| S2-D06 | Create dispatcher UniApp project skeleton | Kecen | High | Dispatcher app includes basic login and map/operation pages. |
| S2-D07 | Create admin Vue 3 dashboard skeleton | Liheng / Chenhao | High | Admin dashboard includes layout, routing and initial management pages. |
| S2-D08 | Configure map service integration | Zhicheng / Liheng | High | Frontend can display map view and location-related layers. |
| S2-D09 | Implement basic scooter list/query API | Chenhao | High | Backend can return scooter and parking related data to frontend. |
| S2-D10 | Establish team coding and commit workflow | Jingkun | Medium | Team follows shared repository workflow and keeps commits linked to tasks where possible. |

---

## Sprint 2 Carry-over Items

| Carry-over Item | Reason | Planned Follow-up |
|---|---|---|
| Complete payment and subscription workflow | MVP ride flow has higher priority. | Implement or polish in Sprint 3. |
| More robust dispatcher fault-handling workflow | Requires stable scooter state and fault record model. | Complete operational workflow and verification in Sprint 3. |
| Full user statistics and admin analytics | Data needs to accumulate from ride and operation records. | Add dashboard charts and statistics in Sprint 3. |
| Final deployment documentation | Implementation still changing. | Complete deployment and release documentation in Sprint 3. |

---

## Sprint 2 Review Notes

Sprint 2 should be evaluated mainly by whether the team has moved from design to a working MVP. The most important evidence should include runnable frontend pages, successful backend API calls, database persistence, and a partial end-to-end demonstration from login to scooter query and ride operation. Any unfinished advanced functions should be explicitly carried into Sprint 3 instead of blocking the MVP review.
