flowchart TD
    Start[Start] --> D1{User type?}
    D1 -->|Visitor| Home[Home page]
    Home --> Projects[Projects page]
    Home --> Blog[Blog page]
    Home --> Contact[Contact form]
    Contact --> ContactSubmit[Submit contact]
    ContactSubmit --> ThankYou[Thank you page]
    D1 -->|Admin| Auth[Login page]
    Auth --> AuthAPI[Authenticate user]
    AuthAPI --> D2{Auth successful?}
    D2 -->|Yes| Dashboard[Admin dashboard]
    Dashboard --> ProjectsAdmin[Manage Projects]
    Dashboard --> BlogAdmin[Manage Blog posts]
    ProjectsAdmin --> ProjectCRUD[Project CRUD API]
    BlogAdmin --> BlogCRUD[Blog CRUD API]
    Dashboard --> Logout[Logout]
    Logout --> Start
    D2 -->|No| AuthError[Show login error]
    AuthError --> Auth