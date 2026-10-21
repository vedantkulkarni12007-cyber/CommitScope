import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../shared/Modal'
import Input from '../shared/Input'
import Button from '../shared/Button'
import { useRepoStore } from '../../store/repoStore'
import styles from './AddRepoModal.module.css'

export default function AddRepoModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { addRepo } = useRepoStore()

  const [path, setPath] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState('')
  const [apiError, setApiError] = useState(null)

  function handleReset() {
    setPath('')
    setName('')
    setFieldError('')
    setApiError(null)
    setSubmitting(false)
  }

  function handleClose() {
    handleReset()
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFieldError('')
    setApiError(null)

    const trimmedPath = path.trim()
    if (!trimmedPath) {
      setFieldError('Please specify the filesystem path to a Git repository.')
      return
    }

    setSubmitting(true)
    const result = await addRepo(trimmedPath, name.trim() || null)
    setSubmitting(false)

    if (result.success) {
      handleClose()
      navigate(`/repositories/${result.data.id}`)
    } else {
      setApiError({
        code: result.code || 'REGISTRATION_FAILED',
        message: result.error || 'Failed to register repository',
        detail: result.detail,
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Git Repository"
      subtitle="Connect a local repository to index commits and map architecture"
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Docker environment callout */}
        <div className={styles.dockerNote}>
          <span className={styles.dockerNoteIcon} aria-hidden="true">
            🐳
          </span>
          <div className={styles.dockerNoteContent}>
            <strong>Docker Container Path Requirement:</strong> The CommitScope backend runs
            inside Docker with repository root configured as <code>/repos</code>.
            To register a host repository, ensure it is mounted under <code>repo_mounts</code> in{' '}
            <code>docker-compose.yml</code> (e.g.{' '}
            <code>- C:/projects/my-repo:/repos/my-repo:ro</code>) and provide the container path{' '}
            <code>/repos/my-repo</code> below.
          </div>
        </div>

        {apiError && (
          <div className={styles.errorBanner} role="alert">
            <span className={styles.errorCode}>[{apiError.code}]</span>
            <span className={styles.errorMessage}>{apiError.message}</span>
            {apiError.detail && (
              <span className={styles.errorDetail}>{apiError.detail}</span>
            )}
          </div>
        )}

        <Input
          label="Repository Path (in container / filesystem)"
          id="repo-path-input"
          placeholder="/repos/my-project"
          value={path}
          onChange={(e) => {
            setPath(e.target.value)
            if (fieldError) setFieldError('')
          }}
          error={fieldError}
          helperText="Absolute path to the repository directory containing a .git folder."
          mono
          required
          autoFocus
        />

        <Input
          label="Display Name"
          id="repo-name-input"
          placeholder="my-project"
          value={name}
          onChange={(e) => setName(e.target.value)}
          optional
          helperText="Defaults to the repository directory name if left blank."
        />

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={submitting}
          >
            Connect & Analyze
          </Button>
        </div>
      </form>
    </Modal>
  )
}
