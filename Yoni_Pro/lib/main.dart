import 'package:flutter/material.dart';
// Import necessary packages for API integrations
// import 'package:openai/openai.dart';
// import 'package:elevenlabs/elevenlabs.dart';
// import 'package:plaid/plaid.dart';

void main() {
  runApp(YoniApp());
}

class YoniApp extends StatefulWidget {
  @override
  _YoniAppState createState() => _YoniAppState();
}

class _YoniAppState extends State<YoniApp> {
  int _selectedIndex = 0;
  final List<Widget> _screens = [
    ChatScreen(),
    LoveScreen(),
    WorkoutScreen(),
    FinanceScreen(),
    GoalsScreen(),
    LooksScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Colors.black,
        primaryColor: Color(0xFF001F3F),
        appBarTheme: AppBarTheme(
          backgroundColor: Color(0xFF001F3F),
          titleTextStyle: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        bottomNavigationBarTheme: BottomNavigationBarThemeData(
          backgroundColor: Color(0xFF001F3F),
          selectedItemColor: Colors.white,
          unselectedItemColor: Colors.grey[400],
        ),
      ),
      home: Scaffold(
        appBar: AppBar(
          title: Text("YONI AI"),
          centerTitle: true,
        ),
        body: _screens[_selectedIndex],
        bottomNavigationBar: BottomNavigationBar(
          items: [
            BottomNavigationBarItem(icon: Icon(Icons.chat), label: "Chat"),
            BottomNavigationBarItem(icon: Icon(Icons.favorite), label: "Love"),
            BottomNavigationBarItem(icon: Icon(Icons.fitness_center), label: "Workout"),
            BottomNavigationBarItem(icon: Icon(Icons.attach_money), label: "Finance"),
            BottomNavigationBarItem(icon: Icon(Icons.track_changes), label: "Goals"),
            BottomNavigationBarItem(icon: Icon(Icons.face), label: "Looks"),
          ],
          currentIndex: _selectedIndex,
          onTap: _onItemTapped,
          type: BottomNavigationBarType.fixed,
        ),
      ),
    );
  }
}

// Placeholder for ChatScreen
class ChatScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              "Chat with Yoni AI",
              style: TextStyle(fontSize: 24, color: Colors.white),
            ),
            // Add chat interface here
          ],
        ),
      ),
    );
  }
}

// Placeholder for LoveScreen
class LoveScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              "Dating Advice",
              style: TextStyle(fontSize: 24, color: Colors.white),
            ),
            // Add dating advice interface here
          ],
        ),
      ),
    );
  }
}

// Placeholder for WorkoutScreen
class WorkoutScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              "Workout Tracker",
              style: TextStyle(fontSize: 24, color: Colors.white),
            ),
            // Add workout tracking interface here
          ],
        ),
      ),
    );
  }
}

// Placeholder for FinanceScreen
class FinanceScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              "Finance Tracker",
              style: TextStyle(fontSize: 24, color: Colors.white),
            ),
            // Add finance tracking interface here
          ],
        ),
      ),
    );
  }
}

// Placeholder for GoalsScreen
class GoalsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Text(
          "Goals and Scheduling",
          style: TextStyle(fontSize: 24, color: Colors.white),
        ),
      ),
    );
  }
}

// Placeholder for LooksScreen
class LooksScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Text(
          "Appearance and Grooming",
          style: TextStyle(fontSize: 24, color: Colors.white),
        ),
      ),
    );
  }
}
