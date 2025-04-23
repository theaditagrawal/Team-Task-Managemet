import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Paper,
  Divider,
  Chip,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { projectStatuses, getStatusColor } from '../utils/statusUtils';

const TeamMemberDashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState({});
  const [tasksByProjectId, setTasksByProjectId] = useState({});

  const handleUpdateTaskStatus = async (taskId, newStatus, projectId) => {
    try {
      const headers = { 'X-User-Username': user.username }; 
      const response = await axios.put(`http://localhost:8080/api/tasks/${taskId}/status`, { status: newStatus }, { headers });
      
      setTasksByProjectId(prevTasksMap => {
        const updatedTasks = (prevTasksMap[projectId] || []).map(task => 
          task.id === taskId ? { ...task, status: response.data.status } : task
        );
        return { ...prevTasksMap, [projectId]: updatedTasks };
      });

    } catch (error) {
       console.error(`Error updating status for task ${taskId}:`, error.response ? error.response.data : error.message);
    }
  };

  const fetchProjectsAndData = useCallback(async () => {
    try {
      const projectResponse = await axios.get(`http://localhost:8080/api/projects/team-member/${user.username}`);
      const fetchedProjects = projectResponse.data;
      setProjects(fetchedProjects);

      const notificationsMap = {};
      const tasksMap = {};

      for (const project of fetchedProjects) {
        try {
          const notificationResponse = await axios.get(`http://localhost:8080/api/notifications/project/${project.id}`);
          notificationsMap[project.id] = notificationResponse.data;
        } catch (notifError) {
          console.error(`Error fetching notifications for project ${project.id}:`, notifError);
          notificationsMap[project.id] = [];
        }

        try {
          const taskResponse = await axios.get(`http://localhost:8080/api/tasks/project/${project.id}`);
          tasksMap[project.id] = taskResponse.data; 
        } catch (taskError) {
          console.error(`Error fetching tasks for project ${project.id}:`, taskError);
          tasksMap[project.id] = [];
        }
      }
      setNotifications(notificationsMap);
      setTasksByProjectId(tasksMap);
    } catch (error) {
      console.error('Error fetching projects/data:', error);
    }
  }, [user.username]);

  useEffect(() => {
    fetchProjectsAndData();
  }, [fetchProjectsAndData]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Team Member Dashboard
        </Typography>

        {projects.length === 0 ? (
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography>You are not assigned to any projects.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} key={project.id}>
                <Card elevation={2}>
                  <CardHeader
                    title={project.name}
                    subheader={`Status: ${project.status || 'Unknown'}`}
                    action={
                      <Chip 
                        label={project.status || 'Unknown'} 
                        size="small" 
                        color={getStatusColor(project.status)}
                      />
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {project.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                       <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                       <Typography variant="caption" color="text.secondary">
                        Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}
                       </Typography>
                    </Box>
                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                       <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                       <Typography variant="caption" color="text.secondary">
                        Team Leader: {project.teamLeader}
                       </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />

                    <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                          <AssignmentIcon sx={{ mr: 1 }} /> Tasks
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        {tasksByProjectId[project.id]?.length > 0 ? (
                          <List dense>
                            {tasksByProjectId[project.id].map((task) => {
                              const isAssignedToMe = task.assignedMembers?.includes(user.username);
                              return (
                                <ListItem key={task.id} sx={{ borderBottom: '1px dashed', borderColor: 'divider', py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <ListItemText
                                    primary={task.name}
                                    secondary={
                                      <Box component="span" sx={{ mt: 0.5, display: 'block' }}>
                                        <Typography component="span" variant="body2" color="text.primary" display="block" sx={{ mb: 0.5 }}>
                                          {task.description}
                                        </Typography>
                                        <Chip
                                          label={task.status || 'Unknown'}
                                          size="small"
                                          color={getStatusColor(task.status)}
                                          sx={{ mr: 1 }}
                                        />
                                        <Typography component="span" variant="caption" color="text.secondary">
                                          Assigned: {task.assignedMembers?.join(', ') || 'None'}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                  {isAssignedToMe && (
                                    <FormControl size="small" variant="outlined" sx={{ minWidth: 150, ml: 2 }}>
                                      <InputLabel>Update Task</InputLabel>
                                      <Select
                                        label="Update Task"
                                        value={task.status || ''}
                                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value, project.id)}
                                        startAdornment={ <EditIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }
                                      >
                                        {projectStatuses.map((status) => (
                                          <MenuItem key={status} value={status}>{status}</MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  )}
                                </ListItem>
                              );
                            })}
                          </List>
                        ) : (
                          <Alert severity="info" icon={<InfoIcon fontSize="inherit" />} sx={{ mt: 1 }}>
                            No tasks found for this project.
                          </Alert>
                        )}
                      </AccordionDetails>
                    </Accordion>

                    <Divider sx={{ my: 2 }} />

                    <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                         <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                           <NotificationImportantIcon sx={{ mr: 1 }}/> Project Notifications
                         </Typography>
                      </AccordionSummary>
                       <AccordionDetails sx={{ p: 0 }}>
                         {notifications[project.id]?.length > 0 ? (
                          <List dense>
                            {notifications[project.id].map((notification) => (
                              <ListItem key={notification.id} sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 1, p: 1.5 }}>
                                <ListItemText
                                  primary={notification.title}
                                  secondary={
                                    <Box component="span" sx={{ mt: 0.5, display: 'block' }}>
                                      <Typography component="span" variant="body2" color="text.primary" display="block">
                                        {notification.message}
                                      </Typography>
                                      <Typography component="span" variant="caption" color="text.secondary">
                                        From: {notification.sender} | {new Date(notification.createdAt).toLocaleString()}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                           <Alert severity="info" icon={<InfoIcon fontSize="inherit" />} sx={{ mt: 1 }}>
                              No notifications for this project yet.
                           </Alert>
                        )}
                      </AccordionDetails>
                    </Accordion>

                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default TeamMemberDashboard; 