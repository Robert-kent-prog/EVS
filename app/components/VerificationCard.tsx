import { FontAwesome5 } from "@expo/vector-icons";
import { Href, Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface VerificationCardProps {
  title: string;
  description: string;
  icon: string;
  route: Href;
  colors?: string[]; // Optional colors array
}

export default function VerificationCard({
  title,
  description,
  icon,
  route,
  colors,
}: VerificationCardProps) {
  return (
    <Link href={route} asChild>
      <TouchableOpacity style={styles.card}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name={icon} size={24} color="#0066cc" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 15,
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    color: "#666",
  },
});
