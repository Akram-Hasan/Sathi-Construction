import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../../components/ScreenWrapper";
import BackButton from "../../components/BackButton";
import SearchBar from "../../components/SearchBar";
import FilterBar from "../../components/FilterBar";
import { projectService } from "../../services/projectService";
import { styles } from "../../styles";
import Toast from "../../components/Toast";

export default function ProjectsListScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      if (response.success) {
        const projectsData = response.data || [];
        setProjects(projectsData);
        setFilteredProjects(projectsData);
      } else {
        showToast("Failed to load projects", "error");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      showToast(error.message || "Failed to load projects", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProjects();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  useEffect(() => {
    let filtered = projects;

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name?.toLowerCase().includes(query) ||
          project.projectId?.toLowerCase().includes(query) ||
          project.location?.toLowerCase().includes(query) ||
          project.status?.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  }, [searchQuery, statusFilter, projects]);

  const statusFilters = [
    { label: "All", value: null, icon: "apps-outline", count: projects.length },
    {
      label: "Planning",
      value: "Planning",
      icon: "document-text-outline",
      count: projects.filter((p) => p.status === "Planning").length,
    },
    {
      label: "In Progress",
      value: "In Progress",
      icon: "play-circle-outline",
      count: projects.filter((p) => p.status === "In Progress").length,
    },
    {
      label: "On Hold",
      value: "On Hold",
      icon: "pause-circle-outline",
      count: projects.filter((p) => p.status === "On Hold").length,
    },
    {
      label: "Completed",
      value: "Completed",
      icon: "checkmark-circle-outline",
      count: projects.filter((p) => p.status === "Completed").length,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress":
        return { bg: "#dbeafe", text: "#60a5fa" };
      case "Planning":
        return { bg: "#fef3c7", text: "#f59e0b" };
      case "Completed":
        return { bg: "#d1fae5", text: "#10b981" };
      default:
        return { bg: "#1f2937", text: "#94a3b8" };
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22c55e"
          />
        }
      >
        <BackButton />
        <Text style={styles.sectionTitle}>
          Projects ({filteredProjects.length})
        </Text>

        <View style={{ marginBottom: 16 }}>
          <SearchBar
            placeholder="Search projects by name, ID, location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <FilterBar
            filters={statusFilters}
            selectedFilter={statusFilter}
            onFilterSelect={setStatusFilter}
          />
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
            const statusColor = getStatusColor(project.status);
            return (
              <TouchableOpacity
                key={project._id || project.id}
                style={[styles.userCard, { marginBottom: 12 }]}
                onPress={() =>
                  navigation?.navigate("ProjectDetail", {
                    projectId: project._id || project.id,
                  })
                }
                activeOpacity={0.7}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Ionicons
                        name="folder"
                        size={18}
                        color="#3b82f6"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.listTitle}>{project.name}</Text>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: statusColor.bg, marginLeft: 8 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: statusColor.text },
                          ]}
                        >
                          {project.status || "N/A"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.listSub}>
                      #{project.projectId || project.id}
                    </Text>
                    {project.location && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 6,
                        }}
                      >
                        <Ionicons name="location" size={14} color="#94a3b8" />
                        <Text style={[styles.listSub, { marginLeft: 4 }]}>
                          {project.location}
                        </Text>
                      </View>
                    )}
                    {project.description && (
                      <Text
                        style={[styles.listDesc, { marginTop: 6 }]}
                        numberOfLines={2}
                      >
                        {project.description}
                      </Text>
                    )}
                    {project.progress !== undefined && (
                      <View style={{ marginTop: 8 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <Text style={[styles.listSub, { fontSize: 11 }]}>
                            Progress
                          </Text>
                          <Text
                            style={[
                              styles.listSub,
                              { fontSize: 11, fontWeight: "600" },
                            ]}
                          >
                            {project.progress}%
                          </Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.progressBar,
                              {
                                width: `${project.progress}%`,
                                backgroundColor:
                                  project.progress >= 70
                                    ? "#22c55e"
                                    : project.progress >= 30
                                    ? "#f59e0b"
                                    : "#ef4444",
                              },
                            ]}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: "#94a3b8", fontSize: 16 }}>
              No projects found
            </Text>
            <Text style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>
              Create a new project to get started
            </Text>
          </View>
        )}
      </ScrollView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </ScreenWrapper>
  );
}
