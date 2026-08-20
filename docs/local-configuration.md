# Local configuration

Rounds keeps deployment values outside the public source tree. Create your own local environment file according to your deployment tooling and populate it only with credentials you control. Never commit that file.

| Variable | Purpose | Public-source value |
|---|---|---|
| `VITE_APP_ID` | Application identity in the configured runtime. | Leave unset locally unless your runtime supplies it. |
| `JWT_SECRET` | Server-side session signing secret. | Generate a private development value; never publish it. |
| `DATABASE_URL` | Optional Community and account data connection. | Use a private local or development database URL. |
| `OAUTH_SERVER_URL` | Optional configured identity-service URL. | Use only an environment you control. |
| `OWNER_OPEN_ID` | Owner-control authorization identifier. | Keep private. |
| `BUILT_IN_FORGE_API_URL` | Configured built-in service endpoint. | Supplied by the deployment runtime where applicable. |
| `BUILT_IN_FORGE_API_KEY` | Configured built-in service credential. | Supplied privately by the deployment runtime where applicable. |

Offline learning, local program selection, saved work, and encrypted local study backup do not require a collaborator to copy any production credential. Community and other server-backed capabilities need suitable development infrastructure before they can be tested end to end.
