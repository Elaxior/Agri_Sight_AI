"use client"

import { useState, useEffect } from 'react'
import { getDetections, getMode } from '@/lib/apiClient'

export function useDetections() {
  const [detections, setDetections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)
  const [mode, setMode] = useState('local')

  const clearDetections = () => {
    setDetections([])
  }

  useEffect(() => {
    let cleanup

    const initializeConnection = async () => {
      try {
        const modeInfo = await getMode()
        setMode(modeInfo.mode)
      } catch {
        // Default to local mode
      }
      cleanup = initializePollingMode()
    }

    const initializePollingMode = () => {
      let pollInterval
      let loadingTimeout

      const pollDetections = async () => {
        try {
          const data = await getDetections()
          if (data.detections && data.detections.length > 0) {
            const sorted = [...data.detections].sort((a, b) => b.frame_id - a.frame_id)
            setDetections(sorted)
            setConnected(true)
            setLoading(false)
          } else if (!connected) {
            setConnected(true)
          }
        } catch (err) {
          console.error('API polling error:', err)
          setConnected(false)
        }
      }

      pollDetections()

      loadingTimeout = setTimeout(() => {
        setLoading(false)
        setConnected(true)
      }, 3000)

      pollInterval = setInterval(pollDetections, 2000)

      return () => {
        clearTimeout(loadingTimeout)
        clearInterval(pollInterval)
      }
    }

    initializeConnection()

    return () => {
      if (cleanup) cleanup()
    }
  }, [])

  return { detections, loading, error, connected, clearDetections, mode }
}

export function useLatestSession() {
  const [latestSessionId, setLatestSessionId] = useState(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await getDetections()
        if (data.session_id) {
          setLatestSessionId(data.session_id)
        }
      } catch (err) {
        console.error('Error fetching session:', err)
      }
    }

    fetchSession()
    const interval = setInterval(fetchSession, 5000)
    return () => clearInterval(interval)
  }, [])

  return { latestSessionId }
}
