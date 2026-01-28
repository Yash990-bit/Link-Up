import React, { useEffect, useState } from 'react'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import { Link } from 'react-router'
import { getOutgoingFriendReqs, getRecommendedUsers, getUserFriends, sendFriendRequest, searchUsers } from '../lib/api'
import { CheckCircleIcon, UserPlusIcon, MapPinIcon, Users2Icon, SearchIcon, XIcon } from 'lucide-react'
import FriendCard, { getLanguageFlag } from '../components/FriendCard'
import NoFriendsFound from '../components/NoFriendsFound'
import { capitialize } from '../lib/utils'

const HomePage = () => {
  const queryClient = useQueryClient()
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set())
  const [removedUserIds, setRemovedUserIds] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: getUserFriends
  })

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getRecommendedUsers
  })

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ['outgoingFriendReqs'],
    queryFn: getOutgoingFriendReqs,
  })

  const { mutate: sendRequestMutation, isPending, error: sendRequestError } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['outgoingFriendReqs'] })
      setRemovedUserIds(prev => new Set(prev).add(userId))
      // Also remove from search results
      setSearchResults(prev => prev.filter(u => u._id !== userId))
    },
  })

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return
    setIsSearching(true)
    try {
      const results = await searchUsers(searchQuery)
      setSearchResults(results)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
  }

  useEffect(() => {
    const outgoingIds = new Set()
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id.toString())
      })
      setOutgoingRequestsIds(outgoingIds)
    }
  }, [outgoingFriendReqs])
  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='container mx-auto space-y-10'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <h2 className='text-2xl sm:text-3xl font-bold tracking-tight'>Your Friends</h2>
          <Link to='/notifications' className='btn btn-outline btn-sm rounded-full'>
            <Users2Icon className='mr-2 size-4' />
            Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className='flex justify-center py-12'>
            <span className='loading loading-spinner loading-lg' />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        {/* Search Section */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Find Friends</h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search users by name..."
                className="input input-bordered w-full pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                  onClick={clearSearch}
                >
                  <XIcon className="size-4" />
                </button>
              )}
            </div>
            <button
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={searchQuery.trim().length < 2 || isSearching}
            >
              {isSearching ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <SearchIcon className="size-5" />
              )}
              Search
            </button>
          </div>

          {showSearchResults && (
            <div className="mt-4">
              {searchResults.length === 0 ? (
                <div className="card bg-base-200 p-6 text-center">
                  <p className="text-base-content opacity-70">No users found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((user) => {
                    const hasRequestBeenSent = outgoingRequestsIds.has(user._id.toString());
                    return (
                      <div key={user._id} className="card bg-base-200 hover:shadow-md transition-all duration-300">
                        <div className="card-body p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="avatar size-12 rounded-full">
                              <img src={user.profilePic} alt={user.fullName} className="rounded-full" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{user.fullName}</h3>
                              {user.location && (
                                <div className="flex items-center text-xs opacity-70">
                                  <MapPinIcon className="size-3 mr-1" />
                                  {user.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="badge badge-secondary text-xs">
                              {getLanguageFlag(user.nativeLanguage)} Native: {capitialize(user.nativeLanguage)}
                            </span>
                            <span className="badge badge-outline text-xs">
                              {getLanguageFlag(user.learningLanguage)} Learning: {capitialize(user.learningLanguage)}
                            </span>
                          </div>
                          <button
                            className={`btn btn-outline btn-sm w-full rounded-full ${hasRequestBeenSent ? "btn-disabled" : ""}`}
                            onClick={() => sendRequestMutation(user._id)}
                            disabled={hasRequestBeenSent || isPending}
                          >
                            {hasRequestBeenSent ? (
                              <>
                                <CheckCircleIcon className="size-4 mr-2" />
                                Request Sent
                              </>
                            ) : (
                              <>
                                <UserPlusIcon className="size-4 mr-2" />
                                Send Request
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {sendRequestError && (
            <div className="alert alert-error mb-4 rounded-xl">
              <span>{sendRequestError.response?.data?.message || sendRequestError.message}</span>
            </div>
          )}

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {recommendedUsers.filter(u => !removedUserIds.has(u._id.toString())).map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id.toString());

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-12 rounded-full">
                          <img src={user.profilePic} alt={user.fullName} className="rounded-full" />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary text-xs">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline text-xs">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                      <button
                        className={`btn btn-outline w-full mt-2 rounded-full ${hasRequestBeenSent ? "btn-disabled" : ""
                          } `}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

    </div>
  )
}

export default HomePage

