import { useState } from 'react'
import { motion } from 'framer-motion'
import { destinations } from '../../data/destinations'
import { budgets, crowdPreferences, durations, interests, paces, transports } from '../../data/plannerOptions'
import { buildDay, generateItinerary, summarize } from '../../utils/planner'
import OptionChips from '../../components/shared/OptionChips'
import type { Interest } from '../../types/destination'
import type { PlannedStop, Preferences } from '../../types/planner'

const stepTitles = ['Start and time', 'Interests', 'Budget and pace', 'Crowds and transport']

const crowdLabel = { 1: 'Usually quieter', 2: 'Moderate', 3: 'Often busy' }

const defaults: Preferences = {
  startId: 'city-palace',
  duration: '1 day',
  interests: ['Heritage'],
  budget: 'Moderate',
  pace: 'Balanced',
  crowd: 'Balanced',
  transport: 'Two-wheeler',
}

export default function TripPlanner() {
  const [prefs, setPrefs] = useState<Preferences>(defaults)
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<'form' | 'loading' | 'result'>('form')
  const [days, setDays] = useState<PlannedStop[][]>([])
  const [removed, setRemoved] = useState<string[]>([])
  const [error, setError] = useState('')

  function pick<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPrefs((current) => ({ ...current, [key]: value }))
  }

  function toggleInterest(item: Interest) {
    pick(
      'interests',
      prefs.interests.includes(item) ? prefs.interests.filter((entry) => entry !== item) : [...prefs.interests, item],
    )
  }

  function next() {
    if (step === 1 && prefs.interests.length === 0) {
      setError('Choose at least one interest.')
      return
    }
    setError('')
    setStep(step + 1)
  }

  function generate(excluded: string[]) {
    setPhase('loading')
    setTimeout(() => {
      setDays(generateItinerary(prefs, excluded))
      setPhase('result')
    }, 1500)
  }

  function handleGenerate() {
    setRemoved([])
    generate([])
  }

  function removeStop(id: string) {
    setRemoved([...removed, id])
    setDays(
      days
        .map((day) =>
          buildDay(
            prefs,
            day.filter((stop) => stop.destination.id !== id).map((stop) => stop.destination),
          ),
        )
        .filter((day) => day.length > 0),
    )
  }

  function editPreferences() {
    setStep(0)
    setPhase('form')
  }

  if (phase === 'loading') {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="font-display text-2xl text-plum-900">Building your Udaipur trip</p>
        <div className="mt-6 h-1.5 rounded-full bg-cream-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="h-1.5 rounded-full bg-plum-600"
          />
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    const summary = summarize(days)
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm font-medium uppercase tracking-wide text-sandstone-600">Your itinerary</p>
        <h1 className="mt-2 text-4xl font-semibold text-plum-900">{prefs.duration} in Udaipur</h1>
        <div className="mt-6 grid grid-cols-3 divide-x divide-sand-300 border-y border-sand-300">
          <div className="py-4 pr-4">
            <p className="text-sm text-ink-500">Stops</p>
            <p className="text-2xl font-semibold text-ink-900">{summary.stops}</p>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-ink-500">Estimated time</p>
            <p className="text-2xl font-semibold text-ink-900">{Math.round(summary.minutes / 6) / 10} h</p>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-ink-500">Estimated cost</p>
            <p className="text-2xl font-semibold text-ink-900">₹{summary.cost}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-500">Costs, times and crowd levels are prototype estimates per person.</p>

        {days.length === 0 && (
          <p className="mt-8 border-t border-sand-300 py-6 text-ink-500">
            No places match these preferences. Try editing your preferences.
          </p>
        )}

        {days.map((day, dayIndex) => (
          <section key={dayIndex} className="mt-10">
            <h2 className="text-2xl font-semibold text-plum-900">Day {dayIndex + 1}</h2>
            {day.map((stop, index) => (
              <motion.article
                key={stop.destination.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="mt-4 border-t border-sand-300 pt-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-ink-900">{stop.destination.name}</h3>
                    <p className="text-sm text-ink-500">
                      {stop.destination.area} · {stop.destination.visitMinutes} min · ₹{stop.destination.entryCost} entry ·{' '}
                      {crowdLabel[stop.destination.typicalCrowd]} (sample)
                    </p>
                  </div>
                  <button
                    onClick={() => removeStop(stop.destination.id)}
                    className="shrink-0 text-sm text-ink-500 hover:text-ink-900"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-2 text-ink-700">{stop.reason}</p>
                <p className="mt-1 text-xs text-ink-500">
                  {index === 0 ? 'From your start' : 'From the previous stop'}: {stop.travelKm} km · about {stop.travelMinutes} min
                </p>
              </motion.article>
            ))}
          </section>
        ))}

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={() => generate(removed)}
            className="rounded-md bg-plum-700 px-5 py-2.5 text-sm font-medium text-cream-50 transition hover:bg-plum-900"
          >
            Regenerate without removed places
          </button>
          <button
            onClick={editPreferences}
            className="rounded-md border border-sand-300 px-5 py-2.5 text-sm text-ink-700 hover:bg-cream-100"
          >
            Edit preferences
          </button>
        </div>
      </div>
    )
  }

  const selectClass =
    'mt-1 w-full rounded-md border border-sand-300 bg-white px-3 py-2 text-ink-900 outline-none focus:border-plum-600'

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-sm font-medium uppercase tracking-wide text-sandstone-600">
        Step {step + 1} of {stepTitles.length}
      </p>
      <h1 className="mt-2 text-4xl font-semibold text-plum-900">{stepTitles[step]}</h1>
      <div className="mt-4 h-1 rounded-full bg-cream-100">
        <div className="h-1 rounded-full bg-plum-600 transition-all" style={{ width: `${((step + 1) / stepTitles.length) * 100}%` }} />
      </div>

      <div className="mt-8 space-y-6">
        {step === 0 && (
          <>
            <label className="block text-sm text-ink-700">
              Starting point
              <select value={prefs.startId} onChange={(e) => pick('startId', e.target.value)} className={selectClass}>
                {destinations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <p className="mb-2 text-sm text-ink-700">How long are you staying?</p>
              <OptionChips options={durations} selected={[prefs.duration]} onToggle={(value) => pick('duration', value)} />
            </div>
          </>
        )}
        {step === 1 && (
          <div>
            <p className="mb-2 text-sm text-ink-700">Pick everything you enjoy.</p>
            <OptionChips options={interests} selected={prefs.interests} onToggle={toggleInterest} />
          </div>
        )}
        {step === 2 && (
          <>
            <div>
              <p className="mb-2 text-sm text-ink-700">Budget</p>
              <OptionChips options={budgets} selected={[prefs.budget]} onToggle={(value) => pick('budget', value)} />
            </div>
            <div>
              <p className="mb-2 text-sm text-ink-700">Travel pace</p>
              <OptionChips options={paces} selected={[prefs.pace]} onToggle={(value) => pick('pace', value)} />
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div>
              <p className="mb-2 text-sm text-ink-700">Crowd preference</p>
              <OptionChips options={crowdPreferences} selected={[prefs.crowd]} onToggle={(value) => pick('crowd', value)} />
            </div>
            <div>
              <p className="mb-2 text-sm text-ink-700">How will you get around?</p>
              <OptionChips options={transports} selected={[prefs.transport]} onToggle={(value) => pick('transport', value)} />
            </div>
          </>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-10 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="rounded-md border border-sand-300 px-5 py-2.5 text-sm text-ink-700 hover:bg-cream-100"
          >
            Back
          </button>
        )}
        {step < stepTitles.length - 1 ? (
          <button
            onClick={next}
            className="rounded-md bg-plum-700 px-5 py-2.5 text-sm font-medium text-cream-50 transition hover:bg-plum-900"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            className="rounded-md bg-plum-700 px-5 py-2.5 text-sm font-medium text-cream-50 transition hover:bg-plum-900"
          >
            Generate My Trip
          </button>
        )}
      </div>
    </div>
  )
}