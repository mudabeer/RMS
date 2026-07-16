import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '../utils/constants'

const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: () => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error?: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve()
  })
  failedQueue = []
}

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject })
        }).then(() => instance(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      return new Promise(async (resolve, reject) => {
        try {
          await instance.post('/auth/refresh')
          processQueue()
          resolve(instance(originalRequest))
        } catch (refreshError) {
          processQueue(refreshError)
          reject(refreshError)
        } finally {
          isRefreshing = false
        }
      })
    }

    return Promise.reject(error)
  },
)

export default instance
