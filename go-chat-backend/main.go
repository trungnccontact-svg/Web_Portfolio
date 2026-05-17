package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	_ "github.com/lib/pq"
)

var (
	db *sql.DB
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all origins for CORS
		},
	}
	clients   = make(map[*websocket.Conn]bool)
	clientsMu sync.Mutex
	broadcast = make(chan Message)
)

type Message struct {
	ID        int       `json:"id"`
	SenderID  string    `json:"sender_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

func initDB() {
	var err error
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Println("DATABASE_URL is not set, skipping DB connection for now")
		return
	}

	db, err = sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Error opening database: %v\n", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatalf("Error connecting to database: %v\n", err)
	}

	log.Println("Connected to PostgreSQL successfully")

	createTableQuery := `
	CREATE TABLE IF NOT EXISTS messages (
		id SERIAL PRIMARY KEY,
		sender_id VARCHAR(50) NOT NULL DEFAULT 'anonymous',
		content TEXT NOT NULL,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);
	ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_id VARCHAR(50) NOT NULL DEFAULT 'anonymous';
	`
	_, err = db.Exec(createTableQuery)
	if err != nil {
		log.Fatalf("Error creating messages table: %v\n", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	log.Println("Incoming WebSocket connection request from:", r.RemoteAddr)
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error upgrading to websocket: %v\n", err)
		return
	}
	log.Println("WebSocket connection upgraded successfully for:", r.RemoteAddr)
	defer ws.Close()

	clientsMu.Lock()
	clients[ws] = true
	clientsMu.Unlock()

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("Error reading json: %v\n", err)
			clientsMu.Lock()
			delete(clients, ws)
			clientsMu.Unlock()
			break
		}

		msg.CreatedAt = time.Now()

		// Save message to DB
		if db != nil {
			err = db.QueryRow("INSERT INTO messages (sender_id, content) VALUES ($1, $2) RETURNING id, created_at", msg.SenderID, msg.Content).Scan(&msg.ID, &msg.CreatedAt)
			if err != nil {
				log.Printf("Error saving message to database: %v\n", err)
			}
		}

		broadcast <- msg
	}
}

func handleMessages() {
	for {
		msg := <-broadcast

		clientsMu.Lock()
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("Error writing json: %v\n", err)
				client.Close()
				delete(clients, client)
			}
		}
		clientsMu.Unlock()
	}
}

func getMessagesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	// Setup CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if db == nil {
		json.NewEncoder(w).Encode([]Message{})
		return
	}

	rows, err := db.Query("SELECT id, sender_id, content, created_at FROM messages ORDER BY created_at ASC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var msg Message
		if err := rows.Scan(&msg.ID, &msg.SenderID, &msg.Content, &msg.CreatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		messages = append(messages, msg)
	}

	if messages == nil {
		messages = []Message{}
	}

	json.NewEncoder(w).Encode(messages)
}

func main() {
	initDB()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	http.HandleFunc("/ws", handleConnections)
	http.HandleFunc("/api/messages", getMessagesHandler)

	go handleMessages()

	log.Printf("Server starting on 0.0.0.0:%s", port)
	err := http.ListenAndServe("0.0.0.0:"+port, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
