import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ChatMessage } from "@shared/schema";
import ReactMarkdown from "react-markdown";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  suggestions: string[];
}

export function ChatInterface({ messages, onSendMessage, isTyping, suggestions }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    const message = inputMessage.trim();
    if (!message) return;

    onSendMessage(message);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  return (
    <Card className="flex flex-col flex-1 min-h-0">
      <CardHeader className="p-4 border-b border-border">
        <h3 className="text-lg font-medium text-foreground">AI Assistant</h3>
        <p className="text-sm text-muted-foreground">Ask questions about your data</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4" data-testid="chat-messages">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Welcome to Excel Data Analysis</p>
              <p className="text-sm mb-4">
                I'll help you analyze your data through insights, visualizations, and calculations.
                Select some tables and ask me questions!
              </p>
              
              {suggestions.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-3">Try asking:</p>
                  <div className="space-y-2">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs"
                        data-testid={`suggestion-${index}`}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 fade-in ${
                  message.sender === 'user' ? 'justify-end' : ''
                }`}
                data-testid={`message-${message.sender}`}
              >
                {message.sender === 'assistant' && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-primary-foreground text-sm" />
                  </div>
                )}
                
                <div className={`message-bubble rounded-lg p-3 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {message.sender === 'assistant' ? (
                    <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-muted-foreground text-sm" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3 fade-in" data-testid="typing-indicator">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-primary-foreground text-sm" />
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <div className="typing-dots flex space-x-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing"></span>
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{ animationDelay: '0.16s' }}></span>
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{ animationDelay: '0.32s' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-3">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your data..."
              className="flex-1"
              disabled={isTyping}
              data-testid="chat-input"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <span className="inline-block w-3 h-3 mr-1">ℹ️</span>
            Selected tables will be used as context for analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
