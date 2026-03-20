import { useState, useEffect } from 'react'
import './App.css'

const TEAM_SIZE = 3
const MAX_POKEMON_ID = 150

function getRandomIds(count) {
  const ids = new Set()
  while (ids.size < count) {
    ids.add(Math.floor(Math.random() * MAX_POKEMON_ID) + 1)
  }
  return [...ids]
}

function PokemonCard({ pokemon, highlight }) {
  return (
    <div className={`pokemon-card ${highlight ? 'winner-card' : ''}`}>
      <img
        src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
        alt={pokemon.name}
        className="pokemon-img"
      />
      <h3 className="pokemon-name">{pokemon.name}</h3>
      <div className="pokemon-exp">
        <span className="exp-label">Base EXP</span>
        <span className="exp-value">{pokemon.base_experience ?? 0}</span>
      </div>
    </div>
  )
}

function TeamSection({ title, team, totalExp, isWinner, className }) {
  return (
    <div className={`team-section ${className} ${isWinner ? 'winner-team' : ''}`}>
      <h2 className="team-title">{title}</h2>
      <div className="team-cards">
        {team.map((p) => (
          <PokemonCard key={p.id} pokemon={p} highlight={isWinner} />
        ))}
      </div>
      <div className="team-exp">
        Total EXP: <strong>{totalExp}</strong>
      </div>
    </div>
  )
}

function App() {
  const [team1, setTeam1] = useState([])
  const [team2, setTeam2] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTeams() {
      try {
        setLoading(true)
        setError(null)
        const ids = getRandomIds(TEAM_SIZE * 2)
        const responses = await Promise.all(
          ids.map((id) => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`))
        )
        const data = await Promise.all(responses.map((r) => r.json()))
        setTeam1(data.slice(0, TEAM_SIZE))
        setTeam2(data.slice(TEAM_SIZE))
      } catch (err) {
        setError('Failed to fetch Pokémon. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchTeams()
  }, [])

  const totalExp1 = team1.reduce((sum, p) => sum + (p.base_experience ?? 0), 0)
  const totalExp2 = team2.reduce((sum, p) => sum + (p.base_experience ?? 0), 0)

  let resultText = ''
  let team1Wins = false
  let team2Wins = false
  if (!loading && team1.length && team2.length) {
    if (totalExp1 > totalExp2) {
      resultText = 'Team 1 Wins!'
      team1Wins = true
    } else if (totalExp2 > totalExp1) {
      resultText = 'Team 2 Wins!'
      team2Wins = true
    } else {
      resultText = "It's a Draw!"
    }
  }

  const handleStartGame = () => {
    window.location.reload()
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Pokedex</h1>
        <button className="start-btn" onClick={handleStartGame}>
          Start Game
        </button>
      </header>

      {loading && (
        <div className="loading">
          <div className="pokeball-spinner"></div>
          <p>Loading Pokémon...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <p>{error}</p>
          <button className="start-btn" onClick={handleStartGame}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="battle-arena">
            <TeamSection
              title="Team 1"
              team={team1}
              totalExp={totalExp1}
              isWinner={team1Wins}
              className="team-1"
            />

            <div className="vs-divider">
              <span className="vs-text">VS</span>
            </div>

            <TeamSection
              title="Team 2"
              team={team2}
              totalExp={totalExp2}
              isWinner={team2Wins}
              className="team-2"
            />
          </div>

          <div className={`result-banner ${team1Wins || team2Wins ? 'has-winner' : 'draw'}`}>
            <span className="result-text">{resultText}</span>
          </div>
        </>
      )}
    </div>
  )
}

export default App
