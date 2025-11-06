# Database Schema Design

This document outlines the recommended database schema for Chicago Community Compass.

## Entity Relationship Overview

```
Users ──┬── Services (created_by)
        ├── Reviews (user_id)
        ├── Favorites (user_id)
        ├── VolunteerSignups (user_id)
        ├── Donations (user_id)
        └── Events (created_by)

Services ──┬── Reviews (service_id)
           ├── Favorites (service_id)
           ├── ServiceCategories (service_id)
           ├── ServicePhotos (service_id)
           ├── VolunteerOpportunities (service_id)
           └── ServiceNeeds (service_id)

Events ──┬── EventRegistrations (event_id)
         └── EventVolunteers (event_id)
```

## Tables

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'resident', -- resident, provider, admin, volunteer
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  organization_name VARCHAR(255), -- For providers
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Services
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- healthcare, food, shelter, etc.
  subcategory VARCHAR(100),
  address TEXT NOT NULL,
  city VARCHAR(100) DEFAULT 'Chicago',
  state VARCHAR(2) DEFAULT 'IL',
  zip VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(500),
  hours_of_operation TEXT,
  eligibility_requirements TEXT,
  languages_spoken TEXT[], -- Array of languages
  accessibility_features TEXT[], -- wheelchair accessible, etc.
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, inactive, rejected
  verified BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  source VARCHAR(50) DEFAULT 'user', -- 'user' or 'chicago_data'
  external_id VARCHAR(255), -- For Chicago Data Portal services
  average_rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_location ON services(latitude, longitude);
CREATE INDEX idx_services_created_by ON services(created_by);
CREATE INDEX idx_services_verified ON services(verified);
```

### ServicePhotos
```sql
CREATE TABLE service_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_service_photos_service_id ON service_photos(service_id);
```

### Reviews
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  verified_visit BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(service_id, user_id) -- One review per user per service
);

CREATE INDEX idx_reviews_service_id ON reviews(service_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

### ReviewPhotos
```sql
CREATE TABLE review_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_review_photos_review_id ON review_photos(review_id);
```

### ProviderResponses
```sql
CREATE TABLE provider_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES users(id),
  response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_provider_responses_review_id ON provider_responses(review_id);
```

### Favorites
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, service_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_service_id ON favorites(service_id);
```

### Events
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  service_id UUID REFERENCES services(id),
  created_by UUID REFERENCES users(id),
  event_type VARCHAR(50), -- workshop, clinic, distribution, etc.
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  location_type VARCHAR(50) DEFAULT 'in_person', -- in_person, virtual, hybrid
  address TEXT,
  virtual_link VARCHAR(500),
  capacity INTEGER,
  registration_required BOOLEAN DEFAULT FALSE,
  registration_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, ongoing, completed, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_service_id ON events(service_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_status ON events(status);
```

### EventRegistrations
```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  registration_data JSONB, -- Additional form data
  status VARCHAR(50) DEFAULT 'registered', -- registered, attended, no_show
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
```

### VolunteerOpportunities
```sql
CREATE TABLE volunteer_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id),
  created_by UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  opportunity_type VARCHAR(50) DEFAULT 'one_time', -- one_time, recurring, flexible
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  time_commitment VARCHAR(100), -- "2 hours", "4 hours per week", etc.
  skills_required TEXT[],
  age_minimum INTEGER,
  training_provided BOOLEAN DEFAULT FALSE,
  location_type VARCHAR(50) DEFAULT 'on_site', -- on_site, remote, hybrid
  address TEXT,
  capacity INTEGER,
  current_signups INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- active, filled, cancelled, completed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_volunteer_opportunities_service_id ON volunteer_opportunities(service_id);
CREATE INDEX idx_volunteer_opportunities_status ON volunteer_opportunities(status);
CREATE INDEX idx_volunteer_opportunities_start_date ON volunteer_opportunities(start_date);
```

### VolunteerSignups
```sql
CREATE TABLE volunteer_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES volunteer_opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  hours_volunteered DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(opportunity_id, user_id)
);

CREATE INDEX idx_volunteer_signups_opportunity_id ON volunteer_signups(opportunity_id);
CREATE INDEX idx_volunteer_signups_user_id ON volunteer_signups(user_id);
```

### ServiceNeeds (Donation Needs)
```sql
CREATE TABLE service_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  need_type VARCHAR(50) NOT NULL, -- items, financial, in_kind
  items_needed TEXT[], -- For item donations
  quantity_needed INTEGER,
  quantity_received INTEGER DEFAULT 0,
  urgency VARCHAR(50) DEFAULT 'normal', -- urgent, high, normal, low
  deadline DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, fulfilled, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_service_needs_service_id ON service_needs(service_id);
CREATE INDEX idx_service_needs_status ON service_needs(status);
CREATE INDEX idx_service_needs_urgency ON service_needs(urgency);
```

### Donations
```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID REFERENCES service_needs(id),
  donor_id UUID REFERENCES users(id),
  donation_type VARCHAR(50) NOT NULL, -- items, financial, in_kind
  amount DECIMAL(10, 2), -- For financial donations
  items JSONB, -- For item donations: [{"item": "Canned food", "quantity": 10}]
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, received, cancelled
  tax_receipt_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_donations_need_id ON donations(need_id);
CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_status ON donations(status);
```

### Notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- new_service, event_reminder, volunteer_match, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(500),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### UserPreferences
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  notification_email BOOLEAN DEFAULT TRUE,
  notification_sms BOOLEAN DEFAULT FALSE,
  notification_push BOOLEAN DEFAULT FALSE,
  preferred_language VARCHAR(10) DEFAULT 'en',
  location_radius INTEGER DEFAULT 10, -- miles
  preferred_categories TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

## Database Functions & Triggers

### Update Service Rating
```sql
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE services
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE service_id = NEW.service_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE service_id = NEW.service_id
    )
  WHERE id = NEW.service_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_service_rating();
```

### Update Timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... repeat for other tables
```

## Prisma Schema (Alternative ORM)

If using Prisma, here's a starter schema:

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String   @id @default(uuid())
  email            String   @unique
  passwordHash     String   @map("password_hash")
  role             String   @default("resident")
  firstName        String?  @map("first_name")
  lastName         String?  @map("last_name")
  phone            String?
  organizationName String?  @map("organization_name")
  verified         Boolean  @default(false)
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  servicesCreated     Service[]              @relation("ServiceCreator")
  reviews             Review[]
  favorites           Favorite[]
  volunteerSignups    VolunteerSignup[]
  donations           Donation[]
  eventsCreated       Event[]                @relation("EventCreator")
  preferences         UserPreference?

  @@map("users")
}

model Service {
  id                    String   @id @default(uuid())
  name                  String
  description           String?
  category              String
  subcategory           String?
  address               String
  city                  String   @default("Chicago")
  state                 String   @default("IL")
  zip                   String?
  latitude              Decimal?
  longitude             Decimal?
  phone                 String?
  email                 String?
  website               String?
  hoursOfOperation      String?  @map("hours_of_operation")
  eligibilityRequirements String? @map("eligibility_requirements")
  languagesSpoken       String[] @map("languages_spoken")
  accessibilityFeatures String[] @map("accessibility_features")
  status                String   @default("pending")
  verified              Boolean  @default(false)
  createdById           String?  @map("created_by")
  source                String   @default("user")
  externalId            String?  @map("external_id")
  averageRating         Decimal  @default(0) @map("average_rating")
  reviewCount           Int      @default(0) @map("review_count")
  viewCount             Int      @default(0) @map("view_count")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  createdBy         User?                @relation("ServiceCreator", fields: [createdById], references: [id])
  photos            ServicePhoto[]
  reviews           Review[]
  favorites         Favorite[]
  events            Event[]
  volunteerOpportunities VolunteerOpportunity[]
  needs             ServiceNeed[]

  @@index([category])
  @@index([status])
  @@index([latitude, longitude])
  @@index([createdById])
  @@map("services")
}
// ... continue for other models
```

## Migration Strategy

### Phase 1: Core Tables
1. Users
2. Services
3. ServicePhotos

### Phase 2: User Features
4. Reviews
5. Favorites
6. UserPreferences

### Phase 3: Provider Features
7. Events
8. EventRegistrations

### Phase 4: Volunteer & Donation
9. VolunteerOpportunities
10. VolunteerSignups
11. ServiceNeeds
12. Donations

### Phase 5: Enhancements
13. Notifications
14. ProviderResponses
15. ReviewPhotos

---

**Note**: This schema is designed to be flexible and scalable. Adjust based on your specific requirements and constraints.

