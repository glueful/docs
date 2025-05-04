export function mapContentNavigationItem(item, options) {
  const navMap = {
    [options?.labelAttribute || "title"]: "label",
    path: "to"
  };
  return Object.keys(item).reduce((link, key) => {
    if (item[key]) {
      const mappedKey = navMap[key] || key;
      link[mappedKey] = item[key];
    }
    return link;
  }, {});
}
export function mapContentNavigation(navigation, options) {
  return navigation.map((item) => mapContentNavigationItem(item, options));
}
export function findPageHeadline(navigation, page) {
  if (!navigation?.length || !page) {
    return;
  }
  for (const link of navigation) {
    if (link.children) {
      for (const childLink of link.children) {
        if (childLink.path === page.path) {
          return link.title;
        }
      }
      const headline = findPageHeadline(link.children, page);
      if (headline) {
        return headline;
      }
    }
  }
}
export function findPageBreadcrumb(navigation, page) {
  if (!navigation?.length || !page) {
    return [];
  }
  return navigation.reduce((breadcrumb, link) => {
    if (page.path && (page.path + "/").startsWith(link.path + "/")) {
      if (link.children) {
        breadcrumb.push(link);
        breadcrumb.push(...findPageBreadcrumb(link.children, page));
      }
    }
    return breadcrumb;
  }, []);
}
