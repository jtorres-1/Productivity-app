import 'package:flutter/material.dart';

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
    Center(child: Text("Fitness Screen")),
    Center(child: Text("Finance Screen")),
    Center(child: Text("Food Screen")),
    Center(child: Text("Chat Screen")),
    Center(child: Text("Love Screen")),
    Center(child: Text("Goals Screen")),
    Center(child: Text("Looks Screen")),
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
        primaryColor: Colors.blue[900],
        scaffoldBackgroundColor: Colors.blue[50],
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.blue[900],
          titleTextStyle: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
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
            BottomNavigationBarItem(icon: Icon(Icons.fitness_center), label: "Fitness"),
            BottomNavigationBarItem(icon: Icon(Icons.attach_money), label: "Finance"),
            BottomNavigationBarItem(icon: Icon(Icons.restaurant), label: "Food"),
            BottomNavigationBarItem(icon: Icon(Icons.chat), label: "Chat"),
            BottomNavigationBarItem(icon: Icon(Icons.favorite), label: "Love"),
            BottomNavigationBarItem(icon: Icon(Icons.track_changes), label: "Goals"),
            BottomNavigationBarItem(icon: Icon(Icons.face), label: "Looks"),
          ],
          currentIndex: _selectedIndex,
          selectedItemColor: Colors.white,
          unselectedItemColor: Colors.grey[400],
          backgroundColor: Colors.blue[900],
          onTap: _onItemTapped,
          type: BottomNavigationBarType.fixed,
        ),
      ),
    );
  }
}

class ChatScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Text(
          "Chat with Yoni AI",
          style: TextStyle(fontSize: 24, color: Colors.white),
        ),
      ),
    );
  }
}
D9FE-F6F6