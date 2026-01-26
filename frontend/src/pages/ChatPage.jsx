import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { getStreamToken } from '../lib/api'
import useAuthUser from '../hooks/useAuthUser'
import { StreamChat } from 'stream-chat'
import { Chat, ChannelList, Channel, Window, ChannelHeader, MessageList, MessageInput, Thread, LoadingIndicator } from 'stream-chat-react'
import 'stream-chat-react/dist/css/v2/index.css'
import { Loader } from 'lucide-react'

// You should typically put this in an env variable
const apiKey = import.meta.env.VITE_STREAM_API_KEY

const ChatPage = () => {
  const { authUser } = useAuthUser()
  const { data: tokenData, isLoading: isTokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  })

  const [client, setClient] = useState(null)

  useEffect(() => {
    if (!authUser || !tokenData) return

    const chatClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY || apiKey)

    chatClient.connectUser({
      id: authUser._id,
      name: authUser.fullName,
      image: authUser.profilePic,
    }, tokenData.token)
      .catch((err) => console.error("Connection failure", err))
      .then(() => setClient(chatClient))

    return () => {
      if (chatClient) chatClient.disconnectUser()
    }
  }, [authUser, tokenData])

  if (!authUser || isTokenLoading || !client) return (
    <div className='h-screen flex items-center justify-center'>
      <Loader className='animate-spin size-10 text-primary' />
    </div>
  )

  return (
    <div className='h-screen w-full flex flex-col md:flex-row overflow-hidden bg-base-100'>
      <Chat client={client} theme='messaging dark'> {/* Verify theme name */}
        <div className='w-full md:w-1/3 lg:w-1/4 border-r border-base-300 h-full overflow-y-auto'>
          <ChannelList
            filters={{ members: { $in: [authUser._id] } }}
            sort={{ last_message_at: -1 }}
            showChannelSearch
            Props={{

            }}
          />
        </div>
        <div className='flex-1 h-full flex flex-col'>
          <Channel>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        </div>
      </Chat>
    </div>
  )
}

export default ChatPage