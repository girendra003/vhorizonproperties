# Google Auth Implementation & Bug Analysis

## Implementation Overview

### 1. Initiation
**File**: \`src/pages/UserLoginPage.tsx\`
The process starts in the \`handleGoogleLogin\` function:
\`\`\`typescript
const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: \`\${window.location.origin}/auth/callback\`,
    },
});
\`\`\`
- It uses the standard Supabase Auth method.
- It dynamically sets the redirect URL to \`/auth/callback\` on the current origin.

### 2. Callback Handling
**File**: \`src/pages/AuthCallback.tsx\`
This component is responsible for processing the response from Google/Supabase after the redirect.
- It checks for error parameters in the URL query/hash.
- It calls \`supabase.auth.getSession()\` to exchange the auth code for a session (in PKCE flow) or retrieve the session.
- It redirects the user to \`/dashboard\` on success or \`/login\` on failure.

---

## ⚠️ Identified Bug: Race Condition / Double Invocation

The specific bug hindering Google Signup is likely caused by **React Strict Mode** in development (or component re-mounting) causing the \`useEffect\` hook in \`AuthCallback.tsx\` to run **twice**.

### The Problem
1. **First Run**: \`handleAuthCallback\` executes. \`supabase.auth.getSession()\` is called. It finds the Auth Code in the URL and exchanges it for a Session Token. **Success**.
2. **Second Run** (Immediate): \`handleAuthCallback\` executes again. \`supabase.auth.getSession()\` is called again.
   - If the previous call consumed the Auth Code, this second call might fail because the code is now invalid.
   - Or, it might try to parse the URL again, which might still contain the now-invalid code.
   - This leads to a "Code already used" error or a "No session found" error, causing the user to be redirected back to the login page with an error, despite the first call actually succeeding.

### Recommended Fix
Use a \`useRef\` to ensure the authentication logic only runs once per component mount.

#### Patch for \`src/pages/AuthCallback.tsx\`

\`\`\`typescript
// ... imports
export default function AuthCallback() {
    const navigate = useNavigate();
    const [timeoutReached, setTimeoutReached] = useState(false);
    const processingRef = useRef(false); // [NEW] Add this ref

    useEffect(() => {
        if (processingRef.current) return; // [NEW] Skip if already running
        processingRef.current = true;      // [NEW] Mark as running

        let mounted = true;
        // ... rest of the logic
\`\`\`

---

## Other Potential Issues to Verify

1. **Supabase Redirect URL Whitelist**:
   - Go to your Supabase Dashboard -> Authentication -> URL Configuration.
   - Ensure that \`http://localhost:5173/auth/callback\` (or your production URL) is explicitly added to the **Redirect URLs** list.
   - If this is missing, Supabase guards will block the redirect entirely.

2. **Environment Variables**:
   - Ensure \`VITE_SUPABASE_URL\` and \`VITE_SUPABASE_PUBLISHABLE_KEY\` are correctly set in your \`.env\` file.
