import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './TodoList.css'

function TodoList() {
	const [todos, setTodos] = useState([])
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [status, setStatus] = useState('pending')
	const [filter, setFilter] = useState('all')
	const [editingId, setEditingId] = useState(null)
	const [editingTitle, setEditingTitle] = useState('')
	const [editingDescription, setEditingDescription] = useState('')
	const [deletingId, setDeletingId] = useState(null)
	const [showCelebration, setShowCelebration] = useState(false)
	const [confetti, setConfetti] = useState([])
	const navigate = useNavigate()

	const getCurrentUser = () => {
		const token = localStorage.getItem('token')
		if (!token) {
			navigate('/login')
			return null
		}
		return JSON.parse(atob(token))
	}

	useEffect(() => {
		const user = getCurrentUser()
		if (user) {
			const savedTodos = JSON.parse(
				localStorage.getItem(`todos_${user.id}`) || '[]'
			)
			setTodos(savedTodos)
		}
	}, [])

	const saveTodos = newTodos => {
		const user = getCurrentUser()
		if (user) {
			localStorage.setItem(`todos_${user.id}`, JSON.stringify(newTodos))
		}
	}

	const handleAddTodo = e => {
		e.preventDefault()
		if (!title.trim()) return

		const newTodo = {
			id: Date.now(),
			title,
			description,
			status,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		const newTodos = [...todos, newTodo]
		setTodos(newTodos)
		saveTodos(newTodos)
		setTitle('')
		setDescription('')
		setStatus('pending')
	}

	const handleDeleteTodo = id => {
		setDeletingId(id)
		setTimeout(() => {
			const newTodos = todos.filter(todo => todo.id !== id)
			setTodos(newTodos)
			saveTodos(newTodos)
			setDeletingId(null)
		}, 300)
	}

	const handleStartEdit = todo => {
		setEditingId(todo.id)
		setEditingTitle(todo.title)
		setEditingDescription(todo.description)
	}

	const handleSaveEdit = id => {
		const newTodos = todos.map(todo => {
			if (todo.id === id) {
				return {
					...todo,
					title: editingTitle,
					description: editingDescription,
					updatedAt: new Date().toISOString(),
				}
			}
			return todo
		})
		setTodos(newTodos)
		saveTodos(newTodos)
		setEditingId(null)
	}

	const handleCancelEdit = () => {
		setEditingId(null)
	}

	const createConfetti = () => {
		const confettiElements = []
		for (let i = 0; i < 50; i++) {
			confettiElements.push({
				id: i,
				left: `${Math.random() * 100}%`,
				animationDelay: `${Math.random() * 0.5}s`,
			})
		}
		setConfetti(confettiElements)
	}

	const handleStatusChange = (id, newStatus) => {
		const newTodos = todos.map(todo => {
			if (todo.id === id) {
				const updatedTodo = {
					...todo,
					status: newStatus,
					updatedAt: new Date().toISOString(),
				}

				if (newStatus === 'completed' && todo.status !== 'completed') {
					setShowCelebration(true)
					createConfetti()
					setTimeout(() => {
						setShowCelebration(false)
						setConfetti([])
					}, 2000)
				}

				return updatedTodo
			}
			return todo
		})
		setTodos(newTodos)
		saveTodos(newTodos)
	}

	const filteredTodos = todos.filter(todo => {
		if (filter === 'all') return true
		return todo.status === filter
	})

	const handleLogout = () => {
		localStorage.removeItem('token')
		navigate('/login')
	}

	return (
		<div className='todo-container'>
			{showCelebration && (
				<div className='celebration'>
					{confetti.map(conf => (
						<div
							key={conf.id}
							className='confetti'
							style={{
								left: conf.left,
								animationDelay: conf.animationDelay,
							}}
						/>
					))}
				</div>
			)}

			<div className='todo-header'>
				<h2>Список задач</h2>
				<button onClick={handleLogout} className='logout-btn'>
					Выйти
				</button>
			</div>

			<form onSubmit={handleAddTodo} className='todo-form'>
				<input
					type='text'
					value={title}
					onChange={e => setTitle(e.target.value)}
					placeholder='Название задачи'
					required
				/>
				<textarea
					value={description}
					onChange={e => setDescription(e.target.value)}
					placeholder='Описание задачи'
				/>
				<select value={status} onChange={e => setStatus(e.target.value)}>
					<option value='pending'>В ожидании</option>
					<option value='in_progress'>В процессе</option>
					<option value='completed'>Завершено</option>
				</select>
				<button type='submit'>Добавить задачу</button>
			</form>

			<div className='filter-container'>
				<select value={filter} onChange={e => setFilter(e.target.value)}>
					<option value='all'>Все задачи</option>
					<option value='pending'>В ожидании</option>
					<option value='in_progress'>В процессе</option>
					<option value='completed'>Завершено</option>
				</select>
			</div>

			<div className='todos-list'>
				{filteredTodos.map(todo => (
					<div
						key={todo.id}
						className={`todo-item ${todo.status} ${
							deletingId === todo.id ? 'deleting' : ''
						}`}
					>
						<div className='todo-content'>
							{editingId === todo.id ? (
								<>
									<input
										type='text'
										value={editingTitle}
										onChange={e => setEditingTitle(e.target.value)}
										placeholder='Название задачи'
									/>
									<textarea
										value={editingDescription}
										onChange={e => setEditingDescription(e.target.value)}
										placeholder='Описание задачи'
									/>
									<div className='todo-actions'>
										<button onClick={() => handleSaveEdit(todo.id)}>
											Сохранить
										</button>
										<button onClick={handleCancelEdit}>Отмена</button>
									</div>
								</>
							) : (
								<>
									<h3>{todo.title}</h3>
									<p>{todo.description}</p>
									<div className='todo-dates'>
										<small>
											Создано: {new Date(todo.createdAt).toLocaleString()}
										</small>
										<small>
											Обновлено: {new Date(todo.updatedAt).toLocaleString()}
										</small>
									</div>
								</>
							)}
						</div>
						{editingId !== todo.id && (
							<div className='todo-actions'>
								<select
									value={todo.status}
									onChange={e => handleStatusChange(todo.id, e.target.value)}
									className={todo.status}
								>
									<option value='pending'>В ожидании</option>
									<option value='in_progress'>В процессе</option>
									<option value='completed'>Завершено</option>
								</select>
								<button
									onClick={() => handleStartEdit(todo)}
									className='edit-button'
								>
									Редактировать
								</button>
								<button onClick={() => handleDeleteTodo(todo.id)}>
									Удалить
								</button>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	)
}

export default TodoList
