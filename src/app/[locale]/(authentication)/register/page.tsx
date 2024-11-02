import Link from "next/link";

export default function Register() {
    return (
      <div>
        <main>
          <ol>
            <li>Register here.</li>
            <Link href="/login">login here</Link>
          </ol>
        </main>
      </div>
    );
  }
  