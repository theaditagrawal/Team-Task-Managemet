import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Grid,
  Paper,
  Divider,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddTaskIcon from '@mui/icons-material/AddTask';
import AssignmentIcon from '@mui/icons-material/Assignment';
import axios from 'axios';
import { projectStatuses, getStatusColor } from '../utils/statusUtils';

const TeamLeaderDashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState({});
  const [tasksByProjectId, setTasksByProjectId] = useState({});
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
  const [selectedProjectForNotif, setSelectedProjectForNotif] = useState('');
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
  });
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [currentProjectForTask, setCurrentProjectForTask] = useState(null);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    assignedMembers: [],
  });

  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/projects/${projectId}/status`, { status: newStatus });
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === projectId ? { ...p, status: response.data.status } : p
        )
      );
    } catch (error) {
      console.error(`Error updating status for project ${projectId}:`, error);
    }
  };

  const fetchProjectsAndTasks = useCallback(async () => {
    try {
      const projectResponse = await axios.get(`http://localhost:8080/api/projects/team-leader/${user.username}`);
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
      console.error('Error fetching projects/tasks:', error);
    }
  }, [user.username]);

  useEffect(() => {
    fetchProjectsAndTasks();
  }, [fetchProjectsAndTasks]);

  const handleCreateNotification = async () => {
    if (!selectedProjectForNotif || !newNotification.title || !newNotification.message) {
      console.error('Project, title, and message are required');
      return;
    }
    try {
      await axios.post('http://localhost:8080/api/notifications', {
        ...newNotification,
        projectId: selectedProjectForNotif,
        sender: user.username,
      });
      setOpenNotificationDialog(false);
      setNewNotification({ title: '', message: '' });
      setSelectedProjectForNotif('');
      try {
        const notificationResponse = await axios.get(`http://localhost:8080/api/notifications/project/${selectedProjectForNotif}`);
        setNotifications(prev => ({ ...prev, [selectedProjectForNotif]: notificationResponse.data }));
      } catch (notifError) {
        console.error(`Error refetching notifications for project ${selectedProjectForNotif}:`, notifError);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleOpenTaskDialog = (project) => {
    setCurrentProjectForTask(project);
    setNewTask({ name: '', description: '', assignedMembers: [] });
    setOpenTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setCurrentProjectForTask(null);
  };

  const handleCreateTask = async () => {
    if (!currentProjectForTask || !newTask.name || newTask.assignedMembers.length === 0) {
        console.error('Task name and at least one assigned member are required.');
        return;
    }

    try {
      const taskData = {
        ...newTask,
        projectId: currentProjectForTask.id,
      };
      const headers = { 'X-User-Username': user.username }; 
      const response = await axios.post('http://localhost:8080/api/tasks', taskData, { headers });
      
      const newTaskData = response.data;
      setTasksByProjectId(prev => ({
        ...prev,
        [currentProjectForTask.id]: [...(prev[currentProjectForTask.id] || []), newTaskData]
      }));

      handleCloseTaskDialog();
    } catch (error) {
      console.error('Error creating task:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Team Leader Dashboard
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SendIcon />}
              onClick={() => setOpenNotificationDialog(true)}
            >
              Send Notification
            </Button>
          </Grid>
        </Grid>

        {projects.length === 0 ? (
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography>You are not leading any projects.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} key={project.id}>
                <Card elevation={2}>
                  <CardHeader
                    title={project.name}
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

                    <FormControl size="small" variant="outlined" sx={{ minWidth: 150, mt: 1, mb: 2 }}>
                      <InputLabel>Update Status</InputLabel>
                      <Select
                        label="Update Status"
                        value={project.status || ''}
                        onChange={(e) => handleUpdateStatus(project.id, e.target.value)}
                        startAdornment={ <EditIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }
                      >
                        {projectStatuses.map((status) => (
                          <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <GroupIcon sx={{ mr: 1 }}/> Team Members
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {project.teamMembers && project.teamMembers.length > 0 ? (
                        project.teamMembers.map((member) => (
                          <Chip key={member} label={member} variant="outlined" size="small" />
                        ))
                      ) : (
                        <Typography variant="caption">No members assigned.</Typography>
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                         <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AssignmentIcon sx={{ mr: 1 }}/> Tasks
                         </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                         {tasksByProjectId[project.id]?.length > 0 ? (
                          <List dense>
                            {tasksByProjectId[project.id].map((task) => (
                              <ListItem key={task.id} sx={{ borderBottom: '1px dashed', borderColor: 'divider', py: 1.5 }}>
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
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                           <Alert severity="info" icon={<InfoIcon fontSize="inherit" />} sx={{ mt: 1 }}>
                              No tasks created for this project yet.
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
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        startIcon={<AddTaskIcon />} 
                        onClick={() => handleOpenTaskDialog(project)}
                        >
                        Create Task
                      </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Dialog open={openNotificationDialog} onClose={() => setOpenNotificationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Notification to Project</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" variant="outlined" required>
            <InputLabel>Select Project</InputLabel>
            <Select
              label="Select Project"
              value={selectedProjectForNotif}
              onChange={(e) => setSelectedProjectForNotif(e.target.value)}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={newNotification.title}
            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            label="Message"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newNotification.message}
            onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenNotificationDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={handleCreateNotification} variant="contained" color="secondary" startIcon={<SendIcon />}>
            Send Notification
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task for {currentProjectForTask?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Name"
            fullWidth
            variant="outlined"
            value={newTask.name}
            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense" variant="outlined" required>
            <InputLabel>Assign Members</InputLabel>
            <Select
              label="Assign Members"
              multiple
              value={newTask.assignedMembers}
              onChange={(e) => setNewTask({ ...newTask, assignedMembers: e.target.value })}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {currentProjectForTask?.teamMembers?.map((member) => (
                <MenuItem key={member} value={member}>
                  {member}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseTaskDialog} color="inherit">Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained" startIcon={<AddTaskIcon />}>
            Create Task
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamLeaderDashboard; 