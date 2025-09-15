import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { notesAPI, tenantAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [tenant, setTenant] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [editingNote, setEditingNote] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchNotes();
    fetchTenant();
  }, [user, router]);

  // Calculate if at limit
  const isAtLimit = tenant?.subscription === 'free' && notes.length >= 3;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            if (!isAtLimit) setShowCreateForm(true);
            break;
          case 'k':
            e.preventDefault();
            document.querySelector('input[placeholder="Search notes..."]')?.focus();
            break;
          case 'e':
            e.preventDefault();
            if (selectedNote) setEditingNote(selectedNote);
            break;
          case 'd':
            e.preventDefault();
            if (selectedNote) handleDeleteNote(selectedNote._id);
            break;
          case '/':
            e.preventDefault();
            setShowShortcuts(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedNote, isAtLimit]);

  const fetchNotes = async () => {
    try {
      const response = await notesAPI.getNotes();
      setNotes(response.data);
    } catch (error) {
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenant = async () => {
    if (!user?.tenant?.slug) return;
    
    try {
      const response = await tenantAPI.getTenant(user.tenant.slug);
      setTenant(response.data.tenant);
    } catch (error) {
      console.error('Failed to fetch tenant info');
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      const response = await notesAPI.createNote(newNote.title, newNote.content);
      setNotes([response.data, ...notes]);
      setNewNote({ title: '', content: '' });
      setShowCreateForm(false);
      toast.success('Note created successfully! 🎉');
    } catch (error) {
      if (error.response?.data?.limitReached) {
        toast.error('Note limit reached! Upgrade to Pro for unlimited notes.');
      } else {
        toast.error('Failed to create note');
      }
    }
  };

  const handleDeleteNote = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await notesAPI.deleteNote(id);
      setNotes(notes.filter(note => note._id !== id));
      if (selectedNote?._id === id) {
        setSelectedNote(null);
      }
      toast.success('Note deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleUpgrade = async () => {
    if (!user?.tenant?.slug) return;
    
    try {
      await tenantAPI.upgradeTenant(user.tenant.slug);
      toast.success('Successfully upgraded to Pro plan! 🚀');
      fetchTenant(); // Refresh tenant info
    } catch (error) {
      toast.error('Failed to upgrade subscription');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Filter and sort notes
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Handle note editing
  const handleEditNote = async (id, updatedData) => {
    try {
      const response = await notesAPI.updateNote(id, updatedData.title, updatedData.content);
      setNotes(notes.map(note => note._id === id ? response.data : note));
      if (selectedNote?._id === id) {
        setSelectedNote(response.data);
      }
      setEditingNote(null);
      toast.success('Note updated successfully! ✨');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white/90 backdrop-blur-lg shadow-xl border-r border-orange-200 flex flex-col relative">
        {/* Neon accent line */}
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-neon-orange via-neon-pink to-neon-blue opacity-60"></div>
        {/* Header */}
        <div className="p-6 border-b border-orange-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">NotesApp</h1>
              <p className="text-sm text-orange-600">{user?.tenant?.name}</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-orange-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{user?.email}</p>
              <p className="text-sm text-orange-600 capitalize">{user?.role}</p>
            </div>
          </div>
          
          {/* Subscription Status */}
          {tenant && (
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-700">Plan</p>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  tenant.subscription === 'pro' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {tenant.subscription.toUpperCase()}
                </span>
              </div>
              {tenant.subscription === 'free' && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">Notes</p>
                  <p className="text-xs text-orange-600">{notes.length}/3</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search and Controls */}
        <div className="p-6 border-b border-orange-200">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-orange-50 border border-orange-200 rounded-xl focus:border-neon-orange focus:outline-none transition-colors duration-200 text-sm"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex items-center justify-between">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 bg-orange-50 border border-orange-200 rounded-lg text-sm focus:border-neon-orange focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">By Title</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-2 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors duration-200"
                title="Keyboard shortcuts (Ctrl+/)"
              >
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Your Notes ({filteredNotes.length})
              </h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                disabled={isAtLimit}
                className="w-8 h-8 bg-gradient-to-r from-neon-orange to-orange-500 text-white rounded-lg hover:from-neon-pink hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center neon-glow hover:animate-pulse"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No notes yet</p>
                <p className="text-gray-400 text-xs mt-1">Create your first note!</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No notes found</p>
                <p className="text-gray-400 text-xs mt-1">Try adjusting your search</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotes.map((note) => (
                  <div
                    key={note._id}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                      selectedNote?._id === note._id
                        ? 'bg-orange-100 border-2 border-neon-orange neon-glow'
                        : 'bg-gray-50 hover:bg-orange-50 border-2 border-transparent hover:border-neon-orange/50'
                    }`}
                  >
                    <div onClick={() => setSelectedNote(note)}>
                      <h3 className="font-medium text-gray-800 text-sm truncate">{note.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{note.content}</p>
                      <p className="text-xs text-orange-500 mt-2">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex items-center justify-end space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNote(note);
                        }}
                        className="p-1 text-orange-500 hover:text-orange-600 hover:bg-orange-100 rounded transition-colors duration-200"
                        title="Edit note"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note._id);
                        }}
                        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-100 rounded transition-colors duration-200"
                        title="Delete note"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-6 border-t border-orange-200">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-orange-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedNote ? selectedNote.title : 'Welcome to your workspace'}
              </h2>
              <p className="text-orange-600">
                {selectedNote ? 'Viewing note' : 'Select a note to view or create a new one'}
              </p>
            </div>
            
            {/* Upgrade Banner */}
            {isAtLimit && isAdmin && (
              <div className="flex items-center space-x-4 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-orange-800">Note limit reached!</p>
                    <p className="text-xs text-orange-700">Upgrade to Pro for unlimited notes</p>
                  </div>
                </div>
                <button
                  onClick={handleUpgrade}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-semibold transition-colors duration-200"
                >
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {showCreateForm ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 animate-slide-up">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Create New Note</h3>
                <form onSubmit={handleCreateNote} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      className="w-full px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-200"
                      placeholder="Enter note title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      rows={8}
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      className="w-full px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-200 resize-none"
                      placeholder="Write your note content here..."
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
                    >
                      Create Note
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 border-2 border-orange-300 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : selectedNote ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 animate-fade-in">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedNote.title}</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <span>By {selectedNote.author.email}</span>
                      <span>•</span>
                      <span>{new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{selectedNote.content.length} characters</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingNote(selectedNote)}
                      className="p-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors duration-200"
                      title="Edit note (Ctrl+E)"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedNote.content);
                        toast.success('Note content copied to clipboard! 📋');
                      }}
                      className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors duration-200"
                      title="Copy content"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteNote(selectedNote._id)}
                      className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors duration-200"
                      title="Delete note (Ctrl+D)"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                      {selectedNote.content}
                    </p>
                  </div>
                </div>
                
                {/* Note Stats */}
                <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>📝 {selectedNote.content.split(' ').length} words</span>
                    <span>📄 {Math.ceil(selectedNote.content.length / 1000)} min read</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Last updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full cyber-grid relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-neon-orange to-neon-pink rounded-full opacity-20 animate-float"></div>
                <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-gradient-to-r from-neon-green to-neon-orange rounded-full opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
              </div>

              <div className="relative z-10 flex items-center justify-center h-full p-8">
                <div className="max-w-4xl w-full">
                  {/* Header with neon effect */}
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-neon-orange to-neon-pink rounded-2xl mb-6 neon-glow animate-neon-pulse">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-orange via-neon-pink to-neon-blue bg-clip-text text-transparent mb-4 neon-text">
                      Welcome to the Future
                    </h1>
                    <p className="text-gray-600 text-lg">Your digital workspace is ready for innovation</p>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {/* Create Note Card */}
                    <div className="group relative">
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-orange-200/50 hover:border-neon-orange transition-all duration-300 hover:neon-glow">
                        <div className="w-12 h-12 bg-gradient-to-r from-neon-orange to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:animate-wiggle">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Create Note</h3>
                        <p className="text-gray-600 text-sm mb-4">Start capturing your ideas and thoughts</p>
                        <button
                          onClick={() => setShowCreateForm(true)}
                          disabled={isAtLimit}
                          className="w-full neon-button text-white py-2 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Get Started
                        </button>
                      </div>
                    </div>

                    {/* Recent Activity Card */}
                    <div className="group relative">
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-orange-200/50 hover:border-neon-blue transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:animate-pulse">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Activity</h3>
                        <p className="text-gray-600 text-sm mb-4">View your latest notes and updates</p>
                        <div className="text-xs text-gray-500">
                          {notes.length > 0 ? (
                            <div className="space-y-1">
                              <p>📝 {notes.length} notes created</p>
                              <p>🕒 Last updated: {new Date(notes[0]?.createdAt).toLocaleDateString()}</p>
                            </div>
                          ) : (
                            <p>No activity yet</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Workspace Stats Card */}
                    <div className="group relative">
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-orange-200/50 hover:border-neon-green transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-r from-neon-green to-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:animate-bounce">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Workspace Stats</h3>
                        <p className="text-gray-600 text-sm mb-4">Your productivity overview</p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>📊 Plan: {tenant?.subscription?.toUpperCase() || 'FREE'}</p>
                          <p>📝 Notes: {notes.length}/{tenant?.subscription === 'free' ? '3' : '∞'}</p>
                          <p>👤 Role: {user?.role?.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Notes Preview */}
                  {notes.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-orange-200/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                          <svg className="w-5 h-5 text-neon-orange mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Recent Notes
                        </h3>
                        <span className="text-sm text-gray-500">Latest 3</span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        {notes.slice(0, 3).map((note, index) => (
                          <div
                            key={note._id}
                            onClick={() => setSelectedNote(note)}
                            className="p-4 bg-white/20 rounded-xl border border-orange-200/30 hover:border-neon-orange cursor-pointer transition-all duration-300 hover:neon-glow group"
                          >
                            <h4 className="font-medium text-gray-800 text-sm mb-2 group-hover:text-neon-orange transition-colors">
                              {note.title}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {note.content}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                              <span className="text-neon-orange">→</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Call to Action */}
                  <div className="text-center mt-12">
                    <button
                      onClick={() => setShowCreateForm(true)}
                      disabled={isAtLimit}
                      className="inline-flex items-center space-x-3 bg-gradient-to-r from-neon-orange via-neon-pink to-neon-blue text-white px-8 py-4 rounded-2xl font-bold text-lg neon-glow hover:animate-pulse disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Create Your First Note</span>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                    <p className="text-gray-500 text-sm mt-4">
                      {isAtLimit ? 'Upgrade to Pro for unlimited notes' : 'Start building your digital knowledge base'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Note</h3>
              <button
                onClick={() => setEditingNote(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleEditNote(editingNote._id, {
                title: formData.get('title'),
                content: formData.get('content')
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingNote.title}
                  className="w-full px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-xl focus:border-neon-orange focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  name="content"
                  rows={8}
                  defaultValue={editingNote.content}
                  className="w-full px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-xl focus:border-neon-orange focus:outline-none transition-colors duration-200 resize-none"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-neon-orange to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-6 py-3 border-2 border-orange-300 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">Create new note</span>
                <kbd className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">Ctrl+N</kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">Search notes</span>
                <kbd className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">Ctrl+K</kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">Edit selected note</span>
                <kbd className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">Ctrl+E</kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">Delete selected note</span>
                <kbd className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">Ctrl+D</kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Show shortcuts</span>
                <kbd className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">Ctrl+/</kbd>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-orange-50 rounded-xl">
              <p className="text-sm text-orange-700">
                💡 <strong>Pro tip:</strong> Use these shortcuts to navigate faster and boost your productivity!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
