import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Collapse,
  Tooltip,
  Paper,
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import api from "../../services/api";
import { useSnackbar } from "notistack";

const FolderTree = ({
  folders,
  selectedFolder,
  onFolderSelect,
  onDeleteFolder,
  onCreateFolder,
  onRenameFolder
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [expandedFolders, setExpandedFolders] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFolderForMenu, setSelectedFolderForMenu] = useState(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderParentId, setNewFolderParentId] = useState("root");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Automatically expand the parent of the selected folder
  useEffect(() => {
    if (selectedFolder && selectedFolder !== "root") {
      // Find the folder
      const folder = folders.find(f => f._id === selectedFolder);
      if (folder && folder.parentId && folder.parentId !== "root") {
        console.log(`Auto-expanding parent ${folder.parentId} of selected folder ${selectedFolder}`);
        
        // Also expand any parent folders in the chain
        let currentFolder = folder;
        let parentsToExpand = {};
        
        while (currentFolder && currentFolder.parentId && currentFolder.parentId !== "root") {
          parentsToExpand[currentFolder.parentId] = true;
          currentFolder = folders.find(f => f._id === currentFolder.parentId);
        }
        
        if (Object.keys(parentsToExpand).length > 0) {
          setExpandedFolders(prev => ({
            ...prev,
            ...parentsToExpand
          }));
        }
      }
    }
  }, [selectedFolder, folders]);

  // Group folders by parent
  const foldersByParent = folders.reduce((acc, folder) => {
    const parentId = folder.parentId || "root";
    if (!acc[parentId]) {
      acc[parentId] = [];
    }
    acc[parentId].push(folder);
    return acc;
  }, {});

  // Sort folders by name
  Object.keys(foldersByParent).forEach(parentId => {
    foldersByParent[parentId].sort((a, b) => a.name.localeCompare(b.name));
  });

  const handleFolderClick = (folderId) => {
    console.log(`Selected folder: ${folderId}`);
    onFolderSelect(folderId);
  };

  const handleExpand = (folderId) => {
    console.log(`Toggling expansion for folder: ${folderId}`);
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleMenuClick = (event, folder) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedFolderForMenu(folder);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedFolderForMenu(null);
  };

  const handleOpenRenameDialog = () => {
    if (selectedFolderForMenu) {
      setNewFolderName(selectedFolderForMenu.name);
      setRenameDialogOpen(true);
      handleCloseMenu();
    }
  };
  
  const openNewFolderDialog = (parentId = "root") => {
    setNewFolderParentId(parentId);
    setNewFolderName("");
    setNewFolderDialogOpen(true);
    handleCloseMenu();
  };
  
  const openDeleteConfirmation = () => {
    setConfirmDeleteOpen(true);
    handleCloseMenu();
  };

  const user_id = localStorage.getItem("user_id");
  
  const handleRenameFolder = async () => {
    if (!selectedFolderForMenu || !newFolderName.trim()) return;
    
    setIsProcessing(true);

    try {
      // Check if we have the dedicated rename function
      if (typeof onRenameFolder === 'function') {
        // Use the dedicated rename function if available
        await onRenameFolder(selectedFolderForMenu._id, newFolderName.trim());
      } else {
        // Fall back to direct API call if no rename function is provided
        const response = await api.put(`/media-manager/folders/${selectedFolderForMenu._id}/${user_id}`, {
          name: newFolderName.trim()
        });
        
        // Log success for debugging
        console.log("Folder renamed successfully:", response.data);
        enqueueSnackbar("Folder renamed successfully", { variant: "success" });
        
        // Fallback refresh mechanism using the createFolder function
        if (typeof onCreateFolder === 'function') {
          // Passing empty strings is understood by MediaManager to trigger refresh
          await onCreateFolder("", "");
        }
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      enqueueSnackbar("Failed to rename folder", { variant: "error" });
    } finally {
      setRenameDialogOpen(false);
      setNewFolderName("");
      setIsProcessing(false);
      setSelectedFolderForMenu(null); // Clear selected folder for menu
    }
  };
  
  const handleCreateNewFolder = async () => {
    if (!newFolderName.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // If onCreateFolder is a function, use it (it should handle the API call)
      if (typeof onCreateFolder === 'function') {
        console.log(`Creating new subfolder "${newFolderName}" with parent ${newFolderParentId}`);
        
        const newFolder = await onCreateFolder(newFolderName.trim(), newFolderParentId);
        
        console.log("Created new folder:", newFolder);
        
        // Auto-expand the parent folder to show the new subfolder
        if (newFolderParentId !== "root") {
          console.log(`Setting expanded state for parent folder ${newFolderParentId}`);
          
          // Ensure parent folder and its parents are all expanded
          setExpandedFolders(prev => {
            // Find all parent folders in the chain
            let currentId = newFolderParentId;
            let expandedParents = { ...prev, [newFolderParentId]: true };
            
            // Expand any parent folders in the chain
            let maxDepth = 5; // Prevent infinite loops
            let depth = 0;
            
            while (currentId && currentId !== "root" && depth < maxDepth) {
              const parentFolder = folders.find(f => f._id === currentId);
              if (!parentFolder) break;
              
              if (parentFolder.parentId && parentFolder.parentId !== "root") {
                expandedParents[parentFolder.parentId] = true;
              }
              
              currentId = parentFolder.parentId;
              depth++;
            }
            
            return expandedParents;
          });
        }
      } else {
        // Otherwise make the API call directly
        await api.post(`/media-manager/folders/${user_id}`, {
          name: newFolderName.trim(),
          parentId: newFolderParentId
        });
        
        enqueueSnackbar("Folder created successfully", { variant: "success" });
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      enqueueSnackbar("Failed to create folder", { variant: "error" });
    } finally {
      setNewFolderDialogOpen(false);
      setNewFolderName("");
      setIsProcessing(false);
    }
  };
  
  const handleDeleteFolder = async () => {
    if (!selectedFolderForMenu) return;
    
    setIsProcessing(true);
    
    try {
      console.log(`Attempting to delete folder: ${selectedFolderForMenu._id} (${selectedFolderForMenu.name})`);
      
      // Check if onDeleteFolder function exists
      if (typeof onDeleteFolder !== 'function') {
        throw new Error('Delete folder function not provided');
      }
      
      // Call parent delete function with the folder ID
      await onDeleteFolder(selectedFolderForMenu._id);
      
      // Close the folder in the UI if it was expanded
      if (expandedFolders[selectedFolderForMenu._id]) {
        setExpandedFolders(prev => {
          const updated = {...prev};
          delete updated[selectedFolderForMenu._id];
          return updated;
        });
      }
      
      enqueueSnackbar("Folder deleted successfully", { variant: "success" });
    } catch (error) {
      console.error("Error deleting folder:", error);
      enqueueSnackbar(error.message || "Failed to delete folder", { variant: "error" });
    } finally {
      setConfirmDeleteOpen(false);
      setIsProcessing(false);
      setSelectedFolderForMenu(null); // Clear selected folder for menu
    }
  };

  const renderFolderItems = (parentId = "root", depth = 0) => {
    const folderItems = foldersByParent[parentId] || [];
    
    return folderItems.map((folder) => {
      const hasChildren = Boolean(foldersByParent[folder._id]?.length);
      const isExpanded = expandedFolders[folder._id];
      const isSelected = selectedFolder === folder._id;
      
      return (
        <React.Fragment key={folder._id}>
          <ListItem
            disablePadding
            sx={{ 
              display: 'block',
              pl: depth * 2,
              backgroundColor: isSelected ? 'action.selected' : 'transparent'
            }}
          >
            <ListItemButton
              onClick={() => handleFolderClick(folder._id)}
              dense
              sx={{ borderRadius: 1 }}
            >
              {hasChildren ? (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand(folder._id);
                  }}
                  sx={{ mr: 0.5 }}
                >
                  {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                </IconButton>
              ) : (
                <Box sx={{ width: 28 }} />
              )}
              
              <ListItemIcon sx={{ minWidth: 36 }}>
                {isSelected ? <FolderOpenIcon color="primary" /> : <FolderIcon />}
              </ListItemIcon>
              
              <ListItemText 
                primary={folder.name}
                primaryTypographyProps={{ 
                  noWrap: true,
                  variant: 'body2',
                  fontWeight: isSelected ? 'medium' : 'regular'
                }}
              />
              
              <IconButton 
                size="small" 
                onClick={(e) => handleMenuClick(e, folder)}
                sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </ListItemButton>
          </ListItem>
          
          {hasChildren && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              {renderFolderItems(folder._id, depth + 1)}
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Folders
        </Typography>
        <Tooltip title="New Folder">
          <IconButton size="small" onClick={() => openNewFolderDialog("root")}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <List
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          borderRadius: 1,
          '& .MuiListItemButton-root:hover': {
            bgcolor: 'action.hover',
          }
        }}
        component="nav"
        dense
      >
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleFolderClick("root")}
            dense
            sx={{ 
              borderRadius: 1,
              bgcolor: selectedFolder === "root" ? 'action.selected' : 'transparent'
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <HomeIcon color={selectedFolder === "root" ? "primary" : "action"} />
            </ListItemIcon>
            <ListItemText 
              primary="All Media"
              primaryTypographyProps={{ 
                fontWeight: selectedFolder === "root" ? 'medium' : 'regular'
              }}
            />
          </ListItemButton>
        </ListItem>
        
        {renderFolderItems()}
      </List>
      
      {/* Folder Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleOpenRenameDialog}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openNewFolderDialog(selectedFolderForMenu?._id)}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New Subfolder</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={openDeleteConfirmation}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onClose={() => !isProcessing && setRenameDialogOpen(false)}>
        <DialogTitle>Rename Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            type="text"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            disabled={isProcessing}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)} disabled={isProcessing}>Cancel</Button>
          <Button 
            onClick={handleRenameFolder} 
            variant="contained" 
            disabled={!newFolderName.trim() || isProcessing}
            startIcon={isProcessing ? <CircularProgress size={16} /> : null}
          >
            {isProcessing ? 'Renaming...' : 'Rename'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onClose={() => !isProcessing && setNewFolderDialogOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            type="text"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            disabled={isProcessing}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialogOpen(false)} disabled={isProcessing}>Cancel</Button>
          <Button 
            onClick={handleCreateNewFolder} 
            variant="contained" 
            disabled={!newFolderName.trim() || isProcessing}
            startIcon={isProcessing ? <CircularProgress size={16} /> : null}
          >
            {isProcessing ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => !isProcessing && setConfirmDeleteOpen(false)}>
        <DialogTitle>Delete Folder</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will move all media in this folder to the parent folder.
          </Alert>
          <Typography>
            Are you sure you want to delete the folder "{selectedFolderForMenu?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} disabled={isProcessing}>Cancel</Button>
          <Button 
            onClick={handleDeleteFolder} 
            variant="contained" 
            color="error"
            disabled={isProcessing}
            startIcon={isProcessing ? <CircularProgress size={16} /> : null}
          >
            {isProcessing ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FolderTree; 