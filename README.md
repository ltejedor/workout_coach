# AI Workout Coach

An interactive web application that acts as your personal AI workout coach, providing real-time motivation and feedback based on your movement. The coach encourages you when you're active and gives you a hard time when you stop moving!

## Features

- **Motion Detection**: Uses device motion sensors to track your physical activity
- **AI-Powered Feedback**: Integrates with Fireworks AI to generate contextual motivational messages
- **Voice Synthesis**: Speaks the coach's messages out loud for hands-free motivation
- **Real-time Interaction**: Provides immediate feedback when you start or stop moving
- **iOS Support**: Includes special handling for iOS motion permissions
- **Responsive Design**: Works on mobile devices with motion sensors

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode
- **API Layer**: tRPC for type-safe client-server communication
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS and Headless UI
- **AI Integration**: Fireworks AI API
- **Speech Synthesis**: Web Speech API

## Prerequisites

- Node.js 18 or later
- PostgreSQL database
- Fireworks AI API key

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure your environment variables in `.env`:
   ```
   # Required
   FIREWORKS_API_KEY=your_fireworks_api_key

   # Database (update if needed)
   DATABASE_URL="postgresql://postgres:postgres@localhost/app"
   ```

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize the database:
   ```bash
   npx prisma db push
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Open the application on a device with motion sensors (like a smartphone)
2. If on iOS, grant motion permissions when prompted
3. Toggle speech on/off using the speaker button
4. Start moving to receive encouraging feedback
5. The coach will motivate you to keep going or get back to it if you stop

## Technical Notes

- Motion detection uses device acceleration data to determine activity
- The coach provides feedback every 10 seconds while you're active
- Motion threshold is calibrated for running/jogging activities
- Speech synthesis prioritizes the 'Ralph' voice but falls back to available alternatives

## Browser Compatibility

- Works best on modern mobile browsers with motion sensors
- Requires permission grants on iOS devices
- Speech synthesis supported on most modern browsers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.
