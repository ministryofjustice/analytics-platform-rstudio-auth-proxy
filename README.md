# analytics-platform-rstudio-auth-proxy
RStudio auth proxy


### Environment variables

- `COOKIE_MAXAGE`, maximum age of session cookies in seconds.
  Defaults to `3600` seconds (1 hours).
  See [`Set-Cookie: MaxAge` documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)


### RStudio authentication cookie
The proxy sets the `user-id` cookie which is checked by RStudio to determine
whether the user is authenticated or not.

The value of this cookie is constructed in the [`auth.js` module](/app/auth.js).
Read the code for the full implementation details and cookie format.

This cookie is signed so that RStudio can verify that the cookie was not tampered with.
