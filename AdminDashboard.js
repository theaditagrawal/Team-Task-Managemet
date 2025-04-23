import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentIcon from '@mui/icons-material/Assignment';
import axios from 'axios';
import { projectStatuses, getStatusColor } from '../utils/statusUtils';

const AdminDashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    deadline: '',
    deliverables: [],
    teamLeader: '',
    teamMembers: [],
    status: 'Not Started',
  });
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
  });
  const [users, setUsers] = useState([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/projects/admin');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, [fetchProjects, fetchUsers]);

  const handleCreateProject = async () => {
    try {
      const projectData = { ...newProject, status: newProject.status || 'Not Started' };
      await axios.post('http://localhost:8080/api/projects', projectData);
      setOpenProjectDialog(false);
      setNewProject({ name: '', description: '', deadline: '', deliverables: [], teamLeader: '', teamMembers: [], status: 'Not Started' });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleCreateNotification = async () => {
    if (!selectedProject || !newNotification.title || !newNotification.message) {
      console.error('Project, title, and message are required');
      return;
    }
    try {
      await axios.post('http://localhost:8080/api/notifications', {
        ...newNotification,
        projectId: selectedProject,
        sender: user.username,
      });
      setOpenNotificationDialog(false);
      setNewNotification({ title: '', message: '' });
      setSelectedProject('');
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleClickOpenConfirmDialog = (projectId) => {
    setProjectToDelete(projectId);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setProjectToDelete(null);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await axios.delete(`http://localhost:8080/api/projects/${projectToDelete}`);
      handleCloseConfirmDialog();
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      handleCloseConfirmDialog();
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Admin Dashboard
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenProjectDialog(true)}
              sx={{ mr: 2 }}
            >
              Create Project
            </Button>
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

        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Manage Projects
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {projects.length === 0 ? (
            <Typography>No projects found.</Typography>
          ) : (
            <List>
              {projects.map((project) => (
                <React.Fragment key={project.id}>
                  <ListItem 
                    alignItems="flex-start"
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => handleClickOpenConfirmDialog(project.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={project.name}
                      secondary={
                        <Box component="span" sx={{ mt: 1 }}>
                          <Typography component="span" variant="body2" display="block" color="text.secondary">
                            {project.description}
                          </Typography>
                          <Typography component="span" variant="caption" display="block" color="text.secondary">
                            Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}
                          </Typography>
                          <Typography component="span" variant="caption" display="block" color="text.secondary">
                            Status: <Chip 
                                      label={project.status || 'Unknown'} 
                                      size="small" 
                                      color={getStatusColor(project.status)}
                                    />
                          </Typography>
                          <Typography component="span" variant="caption" display="block" color="text.secondary">
                            Leader: {project.teamLeader}
                          </Typography>
                          <Typography component="span" variant="caption" display="block" sx={{ mt: 0.5 }}>
                            Members: {' '}
                            {project.teamMembers && project.teamMembers.length > 0 ? (
                              project.teamMembers.map((member) => (
                                <Chip key={member} label={member} size="small" sx={{ mr: 0.5, mt: 0.5 }} variant="outlined" />
                              ))
                            ) : (
                              'None'
                            )}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>

      <Dialog open={openProjectDialog} onClose={() => setOpenProjectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Deadline"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newProject.deadline}
                onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
               <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                >
                  {projectStatuses.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel>Team Leader</InputLabel>
            <Select
              label="Team Leader"
              value={newProject.teamLeader}
              onChange={(e) => setNewProject({ ...newProject, teamLeader: e.target.value })}
              required
            >
              {users
                .filter((u) => u.role === 'teamleader')
                .map((u) => (
                  <MenuItem key={u.id} value={u.username}>
                    {`${u.firstName} ${u.lastName} (${u.username})`}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel>Team Members</InputLabel>
            <Select
              label="Team Members"
              multiple
              value={newProject.teamMembers}
              onChange={(e) => setNewProject({ ...newProject, teamMembers: e.target.value })}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const user = users.find(u => u.username === value);
                    return <Chip key={value} label={`${user?.firstName} ${user?.lastName}`} size="small" />;
                  })}
                </Box>
              )}
            >
              {users
                .filter((u) => u.role === 'teammember')
                .map((u) => (
                  <MenuItem key={u.id} value={u.username}>
                    {`${u.firstName} ${u.lastName} (${u.username})`}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenProjectDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained" startIcon={<AddIcon />}>
            Create Project
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openNotificationDialog} onClose={() => setOpenNotificationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Project Notification</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" variant="outlined" required>
            <InputLabel>Select Project</InputLabel>
            <Select
              label="Select Project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
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

      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this project and all its associated notifications? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteProject} color="error" variant="contained" startIcon={<DeleteIcon />} autoFocus>
            Delete Project
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 