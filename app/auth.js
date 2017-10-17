var crypto = require('crypto');


function formatDate(d) {
  // Eg: Thu, 01 Aug 2017 07:05:08 GMT
  var dateString = d.toLocaleString('en-US', {
    'weekday': 'short', 'day': '2-digit', 'month': 'short', 'year': 'numeric',
    'hour': 'numeric', 'minute': 'numeric', 'second': 'numeric',
    'hour12': false, 'timeZone': 'GMT', 'timeZoneName': 'short'
  });
  var parts = dateString.split(' ');
  // swap month and day
  parts[2] = [parts[1], parts[1] = parts[2]][0];
  // strip comma from day and year
  parts[1] = parts[1].slice(0, 2);
  parts[3] = parts[3].slice(0, 4);
  return parts.join(' ');
}


function expiry(duration) {
  var expires = new Date();
  expires.setTime(expires.getTime() + duration);
  return expires;
}


function base64HMAC(message, key) {
  return crypto.createHmac('SHA256', key).update(message).digest('base64')
}


function secureCookie(value, validDuration, cookieKey) {
  var expires = formatDate(expiry(validDuration));
  var hmac = base64HMAC(value + expires, cookieKey);
  return [value, expires, hmac].map(encodeURIComponent).join('|');
}


module.exports.cookie = secureCookie;
