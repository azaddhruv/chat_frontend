import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import io from 'socket.io-client'

type Message = {
  _id: string
  text: string
  translatedText?: string
}

const socket = io('http://localhost:3000')

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [language, setLanguage] = useState({ from: 'en', to: 'es' }) // Default to English to Spanish

  useEffect(() => {
    socket.on('translation', (data: any) => {
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            _id: Math.random().toString(),
            text: data.translation,
            translatedText: data.translation,
          },
        ])
      } else {
        console.error('Translation error:', data.error)
      }
    })

    return () => {
      socket.off('translation')
    }
  }, [])

  const sendMessage = () => {
    if (text.trim()) {
      // Emit translation request to the backend
      socket.emit('translate', {
        text,
        from: language.from,
        to: language.to,
      })
      setText('')
    }
  }

  const deleteMessage = (_id: string) => {
    setMessages((prev) => prev.filter((msg) => msg._id !== _id))
  }

  const renderItem = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.originalText}>{item.text}</Text>
      <Text style={styles.translatedText}>{item.translatedText}</Text>
      <TouchableOpacity onPress={() => deleteMessage(item._id)}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder='Type your message'
        />
        <Button title='Send' onPress={sendMessage} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 10,
  },
  messageContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  originalText: {
    fontSize: 16,
    color: '#333',
  },
  translatedText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  deleteText: {
    color: '#e74c3c',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
})
