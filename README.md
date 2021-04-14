# DEPRECATED
This proxy/repository is now **deprecated** and not used by the [latest version of our RStudio helm chart (`2.0.0`)](https://github.com/ministryofjustice/analytics-platform-helm-charts/blob/master/charts/rstudio/README.md). Instead, use the other [`auth-proxy`](https://github.com/ministryofjustice/analytics-platform-auth-proxy)/[`auth-proxy-public`](https://github.com/ministryofjustice/analytics-platform-auth-proxy-public) configuring `RSTUDIO_ADD_SECURE_COOKIE`, `RSTUDIO_SECURE_COOKIE_KEY` and `USER` as documented in README's Configuration section.

# analytics-platform-rstudio-auth-proxy
RStudio auth proxy

[![Docker Repository on Quay](https://quay.io/repository/mojanalytics/rstudio-auth-proxy/status "Docker Repository on Quay")](https://quay.io/repository/mojanalytics/rstudio-auth-proxy)

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
