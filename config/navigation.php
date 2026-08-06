<?php

return [

    'academy' => [
        ['label' => 'Dashboard', 'route' => 'academy.dashboard', 'icon' => 'bi-speedometer2'],
        ['label' => 'Teams', 'route' => 'academy.teams.index', 'icon' => 'bi-people'],
        ['label' => 'Players', 'route' => 'academy.players.index', 'icon' => 'bi-person-badge'],
        ['label' => 'Job Board', 'route' => 'academy.jobs.index', 'icon' => 'bi-briefcase'],
        ['label' => 'Access Requests', 'route' => 'academy.access-requests.index', 'icon' => 'bi-shield-check'],
        ['label' => 'Trials', 'route' => 'trials.index', 'icon' => 'bi-calendar-event'],
        ['label' => 'Feed', 'route' => 'feed.index', 'icon' => 'bi-newspaper'],
        ['label' => 'Inbox', 'route' => 'inbox.index', 'icon' => 'bi-chat-dots'],
        ['label' => 'Club Profile', 'route' => 'academy.profile.edit', 'icon' => 'bi-building'],
    ],

    'agent' => [
        ['label' => 'Dashboard', 'route' => 'agent.dashboard', 'icon' => 'bi-speedometer2'],
        ['label' => 'Find Players', 'route' => 'players.index', 'icon' => 'bi-search'],
        ['label' => 'Watchlist', 'route' => 'agent.watchlist.index', 'icon' => 'bi-bookmark-star'],
        ['label' => 'Saved Searches', 'route' => 'saved-searches.index', 'icon' => 'bi-bookmark-star'],
        ['label' => 'Trials', 'route' => 'trials.index', 'icon' => 'bi-calendar-event'],
        ['label' => 'Job Board', 'route' => 'jobs.index', 'icon' => 'bi-briefcase'],
        ['label' => 'My Job Posts', 'route' => 'jobs.mine.index', 'icon' => 'bi-briefcase-fill'],
        ['label' => 'Feed', 'route' => 'feed.index', 'icon' => 'bi-newspaper'],
        ['label' => 'Inbox', 'route' => 'inbox.index', 'icon' => 'bi-chat-dots'],
        ['label' => 'Agency Profile', 'route' => 'agent.profile.edit', 'icon' => 'bi-person-vcard'],
    ],

    'player' => [
        ['label' => 'Dashboard', 'route' => 'player.dashboard', 'icon' => 'bi-speedometer2'],
        ['label' => 'Trials', 'route' => 'trials.index', 'icon' => 'bi-calendar-event'],
        ['label' => 'Feed', 'route' => 'feed.index', 'icon' => 'bi-newspaper'],
        ['label' => 'Inbox', 'route' => 'inbox.index', 'icon' => 'bi-chat-dots'],
        ['label' => 'My Profile', 'route' => 'player.profile.edit', 'icon' => 'bi-person-vcard'],
    ],

    'coach' => [
        ['label' => 'Dashboard', 'route' => 'coach.dashboard', 'icon' => 'bi-speedometer2'],
        ['label' => 'Job Board', 'route' => 'jobs.index', 'icon' => 'bi-briefcase'],
        ['label' => 'My Job Posts', 'route' => 'jobs.mine.index', 'icon' => 'bi-briefcase-fill'],
        ['label' => 'Feed', 'route' => 'feed.index', 'icon' => 'bi-newspaper'],
        ['label' => 'Inbox', 'route' => 'inbox.index', 'icon' => 'bi-chat-dots'],
        ['label' => 'My Profile', 'route' => 'coach.profile.edit', 'icon' => 'bi-person-vcard'],
    ],

    'super_admin' => [
        ['label' => 'Pending Queue', 'route' => 'admin.dashboard', 'icon' => 'bi-hourglass-split'],
        ['label' => 'Analytics', 'route' => 'admin.analytics.index', 'icon' => 'bi-graph-up'],
        ['label' => 'Users', 'route' => 'admin.users.index', 'icon' => 'bi-people'],
        ['label' => 'Reports', 'route' => 'admin.reports.index', 'icon' => 'bi-flag'],
        ['label' => 'Data Records', 'route' => 'admin.data-records.index', 'icon' => 'bi-database'],
        ['label' => 'Activity Log', 'route' => 'admin.logs.index', 'icon' => 'bi-clock-history'],
    ],

];
