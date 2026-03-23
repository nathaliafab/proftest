export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Welcome to ProfTest</h1>
      <p>This Next.js app with TypeScript is running exclusively inside Docker!</p>
      <ul>
        <li>
          <a href="/questions" style={{ color: 'blue', textDecoration: 'underline' }}>
            Go to Manage Questions
          </a>
        </li>
      </ul>
      <p>
        Try visiting the API route: <a href="/api/hello" style={{ color: 'blue' }}>/api/hello</a>
      </p>
    </main>
  )
}