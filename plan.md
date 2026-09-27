# Project Plan

## general description
this is the admin panel for the tripgate app.

the admin panel will be hosted on the same domain. the tenant identification will be extracted by the backend form the user.
this document will descripe the basic login, verification and tenant creation process flow for the projcet, with patterns
to be followed along side all the project features.

the project uses shadcn for the components and UI, zustand for state mangement, react query for the querying and axios for api calls
and react router for the routing.

## steps to be followed.

### 1. React router setup.

for the react router setup use the modern react router in this project get the setup for the 
docs url here [react router docs](https://reactrouter.com/start/declarative/installation)
use the declarative mode for this project.

for authorization gards use react router outlets features.

### 2. Api layer implementation.

the API will be in the src/api folder and it will use axios for it api calls.
the auth flow is jwt+refresh tokens flow.

the project must use the axios-auth-refresh package for the jwt+refresh token flow.

create a client file in the api where the axios client will be located.
use the following code but update the api urls for the tokens refreshing and the data structures as needed.

```ts
import axios from "axios";
import createAuthRefresh from "axios-auth-refresh";

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error("VITE_API_URL is not defined");
}

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshAuthLogic = (failedRequest: any) =>
  axios.post(`${API_URL}/auth/tokens/refresh`, {
    refreshToken: localStorage.getItem('refreshToken')
  }).then((tokenRefreshResponse) => {
    localStorage.setItem('refreshToken', tokenRefreshResponse.data.data.refreshToken);
    localStorage.setItem('accessToken', tokenRefreshResponse.data.data.accessToken);
    failedRequest.response.config.headers['Authorization'] = 'Bearer ' + tokenRefreshResponse.data.data.accessToken;
    return Promise.resolve();
  });

// Instantiate the interceptor
createAuthRefresh(client, refreshAuthLogic);

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return config;
  }
  config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});


export default client;
```
```
```

for the api endpoint we will use a result pattern as specified by this code which should be located in 
srs/lib/result.ts

```ts
interface OkResult<TSuccess, TError extends string> {
  ok: true;
  value: TSuccess;
  when<R>(onSuccess: (value: TSuccess) => R, onFail: (error: TError) => R): R;
}

interface FailResult<TSuccess, TError extends string> {
  ok: false;
  error: TError;
  when<R>(onSuccess: (value: TSuccess) => R, onFail: (error: TError) => R): R;
}

export type Result<TSuccess, TError extends string> =
  | OkResult<TSuccess, TError>
  | FailResult<TSuccess, TError>;

export function ok<TSuccess>(value: TSuccess): OkResult<TSuccess, never> {
  return {
    ok: true,
    value,
    when(onSuccess, _onFail) {
      return onSuccess(value);
    },
  };
}

export function fail<TError extends string>(error: TError): FailResult<never, TError> {
  return {
    ok: false,
    error,
    when(_onSuccess, onFail) {
      return onFail(error);
    },
  };
}
```
```
```


it will be used in the api files like the following.

```ts

export type LoginError =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_LOCKED"
  | "UNKNOWN_ERROR";

export async function login({
  phoneNumber,
  password,
}: {
  phoneNumber: string;
  password: string;
}): Promise<Result<TokensResponse, LoginError>> {
  try {
    const response = await client.post<{ data: TokensResponse }>("/auth/login", {
      phoneNumber,
      password,
    });
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 400) return fail("INVALID_CREDENTIALS");
    if (status === 423) return fail("ACCOUNT_LOCKED");
    return fail("UNKNOWN_ERROR");
  }
}
```
```
```
error come from the api docs and each endpoint is structured like this. the error then under it directly the calling function.


for the responses create a responses.ts folder in the api project init add the error response and the success response and the paginated response to be used by the endpoints.

for where to find the api endpoints and descriptions its located in ./v1.yaml as open api spec.

for each section like registeration, user, password create a file to include the endpoints in the api folder.
for the models in the src create models folder and add the models in it and use them in the api.




### 3. The UI.

the UI will be a sidebar layout with a topbar. with a blueish color for the buttons and white and gray for the background no gradent and no blue for the background. for the sidebar it should be a dark blue color. use the dark blue as a helper when needed.

for the auth pages the login registeration etc will be a split design with form on one end and image on the other leave it empty for the image for now.

the app must be in rtl arabic(iraqi) but formal arabic layout and text.
the components must not be very big or very compact they must be modern and acceable and not very light so they can be seen in light environments.

### 4. the app workflow.
the workflow for the auth and registeration.

first the app check for the user to get him first from the api endpoint via get user.
if the user is not authorized then the app will redirect to the login page.
if the user is authorized but not confirmed the app will redirect to the confirm page.
if the user is authorized and confirmed but has no tenant id then the app will redirect to the create tenant page.

and if all the above is done the app will redirect to the home page.


for the user when getting it use a context or use a zustand store. and use it to do the user navigation and page protection via guards.

### 5. project structure.

src/
├── api/
│   ├── client.ts
│   ├── responses.ts
│   ├── auth.ts
│   ├── user.ts
│   └── ...
├── pages/
│   ├── auth/
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── dashboard/
│       └── view.tsx
├── layouts/
│   └── dashboard.ts
├── guards/
│   └── auth-guard.tsx
├── stores/
│   └── user-store.ts
└── models/
    ├── user.ts
    └── tenant.ts

## Notes.

dont edit or add anything to the package.json or the package-lock.json.
if you want to install a package install it via npm command.
for the env vars add them to .env file and add it to git because it will not contain any sensitive data.


























