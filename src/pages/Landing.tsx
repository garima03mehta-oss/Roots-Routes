import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F8F3E9]">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-6">
        <h1 className="text-3xl font-bold text-purple-900">
          Roots & Routes
        </h1>

        <Link
          to="/login"
          className="bg-purple-900 text-white px-6 py-2 rounded-lg"
        >
          Login
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="px-10 py-24 text-center">
        <p className="text-purple-700 font-semibold">
          EXPLORE UDAIPUR DIFFERENTLY
        </p>

        <h1 className="text-5xl font-bold text-purple-950 mt-5">
          Discover Hidden Gems.
          <br />
          Connect with Culture.
          <br />
          Travel with Purpose.
        </h1>

        <p className="text-gray-600 mt-6 text-lg">
          Experience local culture, discover hidden destinations,
          and travel sustainably.
        </p>

        <div className="flex justify-center gap-4 mt-10">
          <Link
            to="/login"
            className="bg-purple-900 text-white px-7 py-3 rounded-lg"
          >
            Get Started
          </Link>

          <Link
            to="/dashboard"
            className="border border-purple-900 text-purple-900 px-7 py-3 rounded-lg"
          >
            Explore Dashboard
          </Link>
        </div>
      </section>

    </div>
  )
}