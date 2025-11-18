import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import EnhancedInput from "../../components/EnhancedInput";
import LoadingButton from "../../components/LoadingButton";
import Toast from "../../components/Toast";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validatePhone,
} from "../../utils/validation";
import { authService } from "../../services/authService";

export default function LoginScreen({ onSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const validateForm = () => {
    const newErrors = {};

    if (isRegister) {
      const nameError = validateRequired(name, "Name");
      if (nameError) newErrors.name = nameError;
    }

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password, isRegister ? 6 : 3);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    if (isRegister && phone) {
      const phoneError = validatePhone(phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await authService.login(email.trim(), password);

      if (response.success) {
        showToast("Login successful!", "success");
        setTimeout(() => {
          onSuccess(response.user.role, response.user);
        }, 500);
      } else {
        showToast(response.message || "Login failed", "error");
      }
    } catch (error) {
      const errorMessage =
        error.message ||
        error.errors?.[0]?.msg ||
        "Login failed. Please check your credentials.";
      showToast(errorMessage, "error");

      if (error.errors) {
        const newErrors = {};
        error.errors.forEach((err) => {
          if (err.param === "email") newErrors.email = err.msg;
          if (err.param === "password") newErrors.password = err.msg;
        });
        setErrors(newErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const userData = {
        name: name.trim(),
        email: email.trim(),
        password: password,
        phone: phone.trim() || undefined,
        employeeId: employeeId.trim() || undefined,
      };

      const response = await authService.register(userData);

      if (response.success) {
        showToast("Registration successful!", "success");
        setTimeout(() => {
          onSuccess(response.user.role, response.user);
        }, 500);
      } else {
        showToast(response.message || "Registration failed", "error");
      }
    } catch (error) {
      const errorMessage =
        error.message ||
        error.errors?.[0]?.msg ||
        "Registration failed. Please try again.";
      showToast(errorMessage, "error");

      if (error.errors) {
        const newErrors = {};
        error.errors.forEach((err) => {
          if (err.param === "name") newErrors.name = err.msg;
          if (err.param === "email") newErrors.email = err.msg;
          if (err.param === "password") newErrors.password = err.msg;
          if (err.param === "phone") newErrors.phone = err.msg;
        });
        setErrors(newErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrors({});
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setEmployeeId("");
  };

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <View style={styles.headerWrap}>
                <View style={styles.logoContainer}>
                  <Ionicons
                    name="construct-outline"
                    size={48}
                    color="#22c55e"
                  />
                </View>
                <Text style={styles.brand}>Sathi Constructions</Text>
                <Text style={styles.subtitle}>
                  Building Excellence Together
                </Text>
                <Text style={styles.loginText}>
                  {isRegister ? "Create your account" : "Sign in to continue"}
                </Text>
              </View>

              <View style={styles.card}>
                {isRegister && (
                  <EnhancedInput
                    label="Full Name"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    placeholder="Enter your full name"
                    icon="person-outline"
                    autoCapitalize="words"
                    error={errors.name}
                    required
                  />
                )}

                <EnhancedInput
                  label="Email Address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  placeholder="Enter your email"
                  icon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  required
                />

                <EnhancedInput
                  label="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  placeholder="Enter your password"
                  icon="lock-closed-outline"
                  secureTextEntry
                  error={errors.password}
                  helperText={
                    isRegister ? "Minimum 6 characters" : "Minimum 3 characters"
                  }
                  required
                />

                {isRegister && (
                  <>
                    <EnhancedInput
                      label="Phone Number"
                      value={phone}
                      onChangeText={(text) => {
                        setPhone(text);
                        if (errors.phone) setErrors({ ...errors, phone: "" });
                      }}
                      placeholder="Enter your phone (optional)"
                      icon="call-outline"
                      keyboardType="phone-pad"
                      error={errors.phone}
                    />

                    <EnhancedInput
                      label="Employee ID"
                      value={employeeId}
                      onChangeText={(text) => {
                        setEmployeeId(text);
                        if (errors.employeeId)
                          setErrors({ ...errors, employeeId: "" });
                      }}
                      placeholder="Enter employee ID (optional)"
                      icon="id-card-outline"
                      autoCapitalize="characters"
                      error={errors.employeeId}
                    />
                  </>
                )}

                <LoadingButton
                  title={isRegister ? "Sign Up" : "Sign In"}
                  onPress={isRegister ? handleRegister : handleLogin}
                  loading={loading}
                  icon={isRegister ? "person-add-outline" : "log-in-outline"}
                  fullWidth
                  style={styles.loginButton}
                />

                <TouchableOpacity
                  onPress={toggleMode}
                  style={styles.toggleButton}
                >
                  <Text style={styles.toggleText}>
                    {isRegister
                      ? "Already have an account? "
                      : "Don't have an account? "}
                    <Text style={styles.toggleTextBold}>
                      {isRegister ? "Sign In" : "Sign Up"}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  headerWrap: {
    marginBottom: 40,
    alignItems: "center",
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0b1220",
    borderWidth: 3,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  brand: {
    color: "#e2e8f0",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: "#22c55e",
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  loginText: {
    color: "#94a3b8",
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#0b1220",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1f2937",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButton: {
    marginTop: 24,
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 8,
  },
  footerCredential: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
  },
  toggleButton: {
    marginTop: 20,
    alignItems: "center",
  },
  toggleText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  toggleTextBold: {
    color: "#22c55e",
    fontWeight: "600",
  },
});
