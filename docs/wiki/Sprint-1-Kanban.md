# Sprint 1 Kanban Board

**Sprint:** Sprint 1  
**Period:** 23 Jan 2025 - 28 Jan 2025  
**Sprint Theme:** Project scope definition, system analysis, architecture design, initial repository and wiki setup.  
**Scrum Master:** Jingkun  
**Product Owner:** Liheng

---

## Sprint Goal

The goal of Sprint 1 is to establish the foundation of the Panda Scooter project. The team focuses on clarifying the product scope, identifying user roles, defining core requirements, preparing system design artefacts, and setting up the initial development/documentation environment.

The deliverable of this sprint is not a complete runnable product, but a validated project foundation that allows the team to start implementation in Sprint 2 with clear requirements, architecture, responsibilities, and development direction.

---

## Kanban Summary

| Status | Number of Items | Description |
|---|---:|---|
| Backlog | 3 | Items identified but not selected for Sprint 1 implementation. |
| To Do | 0 | Sprint 1 tasks have been assigned and completed or moved forward. |
| In Progress | 0 | No remaining active Sprint 1 implementation task at sprint close. |
| Review / Verification | 2 | Items requiring team confirmation or minor refinement. |
| Done | 12 | Main Sprint 1 planning, design and setup tasks completed. |

---

## Backlog

| ID | Item | Owner | Priority | Notes |
|---|---|---|---|---|
| S1-B01 | Implement complete rental transaction workflow | Zhicheng / Chenhao | High | Moved to Sprint 2 because Sprint 1 focuses on requirement and design. |
| S1-B02 | Implement administrator dashboard statistics | Chenhao / Liheng | Medium | Requires backend data model and frontend dashboard structure first. |
| S1-B03 | Implement monthly subscription package purchase | Liheng / Zhicheng | Medium | Kept as a later feature after the basic ride flow is stable. |

---

## To Do

| ID | Item | Owner | Priority | Acceptance Criteria |
|---|---|---|---|---|
| - | No remaining Sprint 1 task | - | - | Sprint 1 selected tasks have either been completed or moved to later sprints. |

---

## In Progress

| ID | Item | Owner | Priority | Current Progress |
|---|---|---|---|---|
| - | No active Sprint 1 task | - | - | Sprint 1 is treated as a completed planning/design sprint. |

---

## Review / Verification

| ID | Item | Owner | Priority | Verification Evidence / Next Action |
|---|---|---|---|---|
| S1-R01 | Confirm consistency between use case, activity, class and ER diagrams | Kecen / Chenhao | High | Team review required to ensure that system behaviour and data model are aligned. |
| S1-R02 | Confirm UI wireframe flow before implementation | Liheng / Zhicheng | High | Product Owner and frontend team should confirm user, dispatcher and admin journeys. |

---

## Done

| ID | Item | Owner | Priority | Completion Evidence |
|---|---|---|---|---|
| S1-D01 | Define dockless scooter sharing product scope | Liheng | High | Scope defined around free-floating scooter rental within allowed city zones. |
| S1-D02 | Identify core user roles | Liheng / Jingkun | High | Three roles defined: rider/user, operational manager/dispatcher, administrator. |
| S1-D03 | Define rider-side functional requirements | Liheng / Zhicheng | High | Login/register, map display, rent scooter, return scooter, payment, fault reporting, usage statistics and monthly subscription identified. |
| S1-D04 | Define operational manager requirements | Kecen / Chenhao | High | Manager login, faulty vehicle view, remote unlock and operational statistics identified. |
| S1-D05 | Define administrator requirements | Chenhao / Liheng | High | Pricing management, analytics, subscription package management, zone definition and staff assignment identified. |
| S1-D06 | Create initial GitHub Wiki structure | Jingkun | High | Wiki navigation and project documentation structure created. |
| S1-D07 | Prepare initial project backlog and issue management plan | Jingkun | High | GitHub Wiki and Issues selected as project management tools. |
| S1-D08 | Design use case diagram | Kecen | High | Use case modelling assigned and prepared for system behaviour documentation. |
| S1-D09 | Design activity diagram | Kecen | Medium | Activity flow modelling assigned for main user/system processes. |
| S1-D10 | Design deployment diagram | Kecen | Medium | Deployment modelling assigned to describe client-server architecture. |
| S1-D11 | Design class diagram and ER diagram | Chenhao | High | Backend design artefacts assigned to support later implementation. |
| S1-D12 | Prepare UniApp project direction and wireframes | Liheng / Zhicheng / Jingkun | High | UniApp selected for cross-platform user and manager apps; wireframe work assigned. |

---

## Sprint 1 Carry-over Items

| Carry-over Item | Reason | Planned Follow-up |
|---|---|---|
| API details and endpoint definitions | Backend design needed to be stabilised first. | Complete API documentation during Sprint 2. |
| Runnable frontend prototype | Wireframes and framework direction were prioritised first. | Build rider, dispatcher and admin interface skeletons in Sprint 2. |
| End-to-end rental flow | Requires backend database, authentication and scooter state management. | Implement as Sprint 2 core MVP feature. |

---

## Sprint 1 Review Notes

Sprint 1 successfully established the product direction and team responsibilities. The key outcome is that the team now has a shared understanding of system actors, main features, tools, and design responsibilities. The next sprint should move from planning artefacts to working software, with priority on authentication, scooter map display, basic ride lifecycle, and administrator/dispatcher management functions.
