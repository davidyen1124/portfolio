export async function loadRepositories() {
  try {
    const repoResponse = await fetch(
      'https://api.github.com/users/davidyen1124/repos?sort=updated&per_page=20'
    );
    const repositories = await repoResponse.json();

    let spotifyTrack = null;
    try {
      const spotifyResponse = await fetch(
        'https://spotify.daviddennislinda.com/api/recently-played'
      );
      spotifyTrack = await spotifyResponse.json();
    } catch (spotifyError) {
      console.error('Error loading Spotify data:', spotifyError);
    }

    return { repositories, spotifyTrack };
  } catch (error) {
    console.error('Error loading repositories:', error);
    document.getElementById('loading').innerHTML =
      'Error loading repositories. Please refresh.';
    return { repositories: [], spotifyTrack: null };
  }
}
