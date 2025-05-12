---
title: Glueful Extensions
description: Discover the powerful extensions available for the Glueful framework.
navigation:
  icon: i-lucide-puzzle
---

# Glueful Extensions

Extensions are modular components that add functionality to your Glueful application without modifying the core codebase. This modular approach allows you to choose only the features that your application needs, keeping your codebase lean and focused.

## Why Use Extensions?

- **Modularity**: Add functionality only when you need it
- **Maintainability**: Reduce complexity of your core application
- **Flexibility**: Easily swap or upgrade individual components  
- **Productivity**: Leverage pre-built solutions for common needs
- **Customization**: Extend or modify extension behavior as needed

## Available Extensions

Browse our collection of official extensions designed to enhance your Glueful applications:


::card-group{class="gap-4 my-8"}
  :::card{to="#"}
  ---
  icon: i-lucide-mail
  target: _blank
  title: Email Notification
  ---
  Provides email notification capabilities using SMTP/PHPMailer, including template-based emails, HTML and plain text formats with customizable layouts.
  :::

  :::card{to="#"}
  ---
  icon: i-lucide-user-check
  target: _blank
  title: Social Login
  ---
  Provides social authentication through Google, Facebook and GitHub, enabling seamless integration with popular authentication providers.
  :::

  :::card{to="#"}
  ---
  icon: i-lucide-layout-dashboard
  title: Admin
  ---
  Provides a comprehensive admin dashboard UI to visualize and manage the API Framework, monitor system health, and perform administrative actions through a user-friendly interface.
  :::
::

## Getting Started with Extensions

To use an extension, you'll need to add it to your project and configure it. Here's how to get started:

```php
// In config/extensions.php
return [
    'enabled' => [
        // other extensions...
        'Admin',
        'SocialLogin',
        'EmailNotification',
    ],
];
```

Learn more about [installing extensions](/docs/extensions/extension-overview#installing-extensions) and [creating your own extensions](/docs/extensions/creating-extensions).
