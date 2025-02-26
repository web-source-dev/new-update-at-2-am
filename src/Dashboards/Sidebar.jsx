import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Typography,
  Divider,
  Collapse,
  Box,
  Popper,
  Paper,
  ClickAwayListener,
} from "@mui/material";
import {
  Home,
  Person,
  Settings,
  Description,
  Menu,
  ChevronLeft,
  GroupAdd,
  AssignmentInd,
  Lock,
  AccountBox,
  Visibility,
  CloudUpload,
  LocalOffer,
  Campaign,
  Announcement,
  TrackChanges,
  Speed,
  BugReport,
  History,
  ExpandLess,
  ExpandMore,
  Dashboard,
  Analytics as AnalyticsIcon,
  SupervisorAccount,
  MonitorHeart,
  Assessment,
  ContentPaste,
  Store,
  Inventory,
  ShoppingCart,
  Business,
  LocalShipping,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import Links from "../Components/Buttons/Links";

const Sidebar = ({ match, links }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [openPopupMenu, setOpenPopupMenu] = useState(null);

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);
  const toggleSubmenu = (title) => {
    setOpenSubmenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handlePopupMenu = (event, title) => {
    if (!isOpen) {
      setAnchorEl(event.currentTarget);
      setOpenPopupMenu(openPopupMenu === title ? null : title);
    } else {
      toggleSubmenu(title);
    }
  };

  const handleClosePopup = () => {
    setOpenPopupMenu(null);
    setAnchorEl(null);
  };

  const getIcon = (label) => {
    switch (label) {
      case "Dashboard":
        return <Dashboard />;
      case "Analytics":
        return <AnalyticsIcon />;
      case "User Manage":
        return <SupervisorAccount />;
      case "User Monitoring":
        return <MonitorHeart />;
      case "Overview":
        return <Assessment />;
      case "Splash Content":
        return <ContentPaste />;
      case "Deal Management":
        return <LocalOffer />;
      case "Announcements":
        return <Announcement />;
      case "Orders":
        return <ShoppingCart />;
      case "Suppliers":
        return <LocalShipping />;
      case "Profile":
        return <Person />;
      case "Deal Create":
        return <Store />;
      case "Deal manage":
        return <Business />;
      case "Deal Bulk":
        return <Inventory />;
      case "User Creation/Deletion":
        return <GroupAdd />;
      case "Role Assignment":
        return <AssignmentInd />;
      case "Access Control":
        return <Lock />;
      case "Profile Management":
        return <AccountBox />;
      case "System-wide User Monitoring":
        return <Visibility />;
      case "Splash Page Content Upload":
        return <CloudUpload />;
      case "Promotional Content Management":
        return <Campaign />;
      case "System-wide Announcements":
        return <Announcement />;
      case "User Activity Tracking":
        return <TrackChanges />;
      case "System Performance Metrics":
        return <Speed />;
      case "Error Logging":
        return <BugReport />;
      case "Audit Trails":
        return <History />;
      case "All Commitments":
        return <AssignmentIcon />;
      default:
        return <Description />;
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <IconButton
        onClick={toggleMobileSidebar}
        sx={{ position: "fixed", top: 5, left: 5, zIndex: 1300, display: { xs: "block", sm: "block", md: "none" } }}
      >
        <Menu />
      </IconButton>

      {/* Sidebar for Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "none", md: "block" },
          width: isOpen ? 240 : 80,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isOpen ? 240 : 80,
            transition: "width 0.3s",
            overflowX: "hidden",
          },
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isOpen ? "space-between" : "center",
            padding: "10px 15px",
          }}
        >
          {isOpen && <Typography variant="h6">Dashboard</Typography>}
          <IconButton onClick={toggleSidebar}>{isOpen ? <ChevronLeft /> : <Menu />}</IconButton>
        </div>
        <Divider />
        <List>
          {links.map((link, index) => (
            link.title ? (
              <div key={index}>
                <Tooltip key={index} title={link.title} placement="right" disableHoverListener={isOpen}>
                <ListItem 
                  button 
                  onClick={(e) => handlePopupMenu(e, link.title)}
                >
                  <ListItemIcon sx={{ justifyContent: isOpen ? "space-around" : "center", alignItems: "center", display: "flex", fontSize: "10em" }}>{<LocalOffer />}</ListItemIcon>
                  {isOpen && <ListItemText primary={link.title} />}
                  {isOpen && (
                    (openSubmenus[link.title] ? <ExpandLess /> : <ExpandMore />)
                  )}
                </ListItem>
                  </Tooltip>

                {isOpen ? (
                  <Collapse in={openSubmenus[link.title]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {link.subLinks.map((subLink, subIndex) => (
                        <Tooltip key={subIndex} title={subLink.label} placement="right" disableHoverListener={isOpen}>
                          <ListItem button sx={{ pl: 4 }}>
                            <ListItemIcon sx={{ justifyContent: isOpen ? "space-around" : "center", alignItems: "center", display: "flex", fontSize: "10em" }}>
                              {getIcon(subLink.label)}
                            </ListItemIcon>
                            {isOpen && <ListItemText primary={<Links link={`${match.pathnameBase}/${subLink.path}`} linkText={subLink.label} size="0.97em" />} />}
                          </ListItem>
                        </Tooltip>
                      ))}
                    </List>
                  </Collapse>
                ) : (
                  <Popper
                    open={openPopupMenu === link.title}
                    anchorEl={anchorEl}
                    placement="right-start"
                    style={{ zIndex: 1400 }}
                  >
                    <ClickAwayListener onClickAway={handleClosePopup}>
                      <Paper sx={{ p: 1, bgcolor: 'background.paper' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            minWidth: 180,
                          }}
                        >
                          {link.subLinks.map((subLink, subIndex) => (
                            <ListItem 
                              button 
                              key={subIndex}
                              onClick={handleClosePopup}
                              dense
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                {getIcon(subLink.label)}
                              </ListItemIcon>
                              <ListItemText 
                                primary={
                                  <Links 
                                    link={`${match.pathnameBase}/${subLink.path}`} 
                                    linkText={subLink.label} 
                                    size="0.97em" 
                                  />
                                } 
                              />
                            </ListItem>
                          ))}
                        </Box>
                      </Paper>
                    </ClickAwayListener>
                  </Popper>
                )}
              </div>
            ) : (
              <Tooltip key={index} title={link.label} placement="right" disableHoverListener={isOpen}>
                <ListItem button>
                  <ListItemIcon sx={{ justifyContent: isOpen ? "space-around" : "center", alignItems: "center", display: "flex", fontSize: "10em" }}>
                    {getIcon(link.label)}
                  </ListItemIcon>
                  {isOpen && <ListItemText primary={<Links link={`${match.pathnameBase}/${link.path}`} linkText={link.label} size="0.97em" />} />}
                </ListItem>
              </Tooltip>
            )
          ))}
        </List>
      </Drawer>

      {/* Sidebar for Mobile */}
      <Drawer
        variant="temporary"
        open={isMobileOpen}
        onClose={toggleMobileSidebar}
        sx={{ "& .MuiDrawer-paper": { width: 240, pt: "20px" } }}
        anchor="left"
      >
        <List>
          {links.map((link, index) => (
            link.title ? (
              <div key={index}>
                <ListItem button onClick={() => toggleSubmenu(link.title)}>
                  <ListItemIcon>{getIcon(link.title)}</ListItemIcon>
                  <ListItemText primary={link.title} />
                  {openSubmenus[link.title] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openSubmenus[link.title]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {link.subLinks.map((subLink, subIndex) => (
                      <ListItem button key={subIndex} onClick={toggleMobileSidebar} sx={{ pl: 4 }}>
                        <ListItemIcon>{getIcon(subLink.label)}</ListItemIcon>
                        <ListItemText primary={<Links link={`${match.pathnameBase}/${subLink.path}`} linkText={subLink.label} />} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </div>
            ) : (
              <ListItem button key={index} onClick={toggleMobileSidebar}>
                <ListItemIcon>{getIcon(link.label)}</ListItemIcon>
                <ListItemText primary={<Links link={`${match.pathnameBase}/${link.path}`} linkText={link.label} />} />
              </ListItem>
            )
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
